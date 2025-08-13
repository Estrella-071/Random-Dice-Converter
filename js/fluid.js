<script>
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fluidCanvas');
    if (!canvas) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        canvas.style.display = 'none';
        return;
    }
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 1,
        VELOCITY_DISSIPATION: 0.2,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLORFUL: false,
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: false,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.8,
        BLOOM_THRESHOLD: 0.6,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 1.0,
    };
    
    function pointerPrototype() { this.id = -1; this.texcoordX = 0; this.texcoordY = 0; this.prevTexcoordX = 0; this.prevTexcoordY = 0; this.deltaX = 0; this.deltaY = 0; this.down = false; this.moved = false; this.color = [30, 0, 300]; }
    let pointers = [new pointerPrototype()];
    let splatStack = [];

    
    function init(gl) {
        const ext = getWebGLExtensions(gl);
        const programs = createPrograms(gl, ext);
        const FBOs = createFBOs(gl, ext);
        const gltf = {
            ext: ext,
            programs: programs,
            width: gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
        };
        return { gltf, programs, FBOs };
    }

    function getWebGLExtensions(gl) {
        const ext_rg = gl.getExtension("EXT_texture_rg");
        const ext_colorBuffer = gl.getExtension("EXT_color_buffer_float") || gl.getExtension("WEBGL_color_buffer_float");
        return {
            formatRGBA: ext_colorBuffer,
            formatRG: ext_rg,
            formatR: ext_rg,
            halfFloat: gl.getExtension("OES_texture_half_float"),
            supportLinearFiltering: gl.getExtension("OES_texture_float_linear")
        };
    }

    class Program {
        constructor(gl, vertexShader, fragmentShader) {
            this.uniforms = {};
            this.program = createProgram(gl, vertexShader, fragmentShader);
            this.uniforms = getUniforms(gl, this.program);
        }
        bind(gl) { gl.useProgram(this.program); }
    }

    const { gltf, programs, FBOs } = init(gl);

    function createProgram(gl, vertexShader, fragmentShader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw gl.getProgramInfoLog(program);
        return program;
    }

    function getUniforms(gl, program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    function createPrograms(gl, ext) {
        const vs = compileShader(gl, gl.VERTEX_SHADER, `precision highp float;
            attribute vec2 a_position;
            varying vec2 v_texcoord;
            void main () {
                v_texcoord = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }`);

        return {
            splat: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_target;
                uniform float u_aspectRatio;
                uniform vec3 u_color;
                uniform vec2 u_point;
                uniform float u_radius;
                void main () {
                    vec2 p = v_texcoord - u_point.xy;
                    p.x *= u_aspectRatio;
                    vec3 splat = exp(-dot(p, p) / u_radius) * u_color;
                    vec3 base = texture2D(u_target, v_texcoord).xyz;
                    gl_FragColor = vec4(base + splat, 1.0);
                }`)),
            advection: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision highp float;
                precision highp sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_velocity;
                uniform sampler2D u_source;
                uniform vec2 u_texelSize;
                uniform vec2 u_dyeTexelSize;
                uniform float u_dt;
                uniform float u_dissipation;
                vec4 bilerp (sampler2D source, vec2 texcoord); 
                void main () {
                    vec2 coord = v_texcoord - texture2D(u_velocity, v_texcoord).xy * u_dt;
                    gl_FragColor = u_dissipation * bilerp(u_source, coord);
                }
                vec4 bilerp (sampler2D source, vec2 texcoord) { 
                    return texture2D(source, texcoord); 
                }`)),
            curl: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_velocity;
                uniform vec2 u_texelSize;
                void main () {
                    float L = texture2D(u_velocity, v_texcoord - vec2(u_texelSize.x, 0.0)).y;
                    float R = texture2D(u_velocity, v_texcoord + vec2(u_texelSize.x, 0.0)).y;
                    float T = texture2D(u_velocity, v_texcoord + vec2(0.0, u_texelSize.y)).x;
                    float B = texture2D(u_velocity, v_texcoord - vec2(0.0, u_texelSize.y)).x;
                    float C = (R - L) * 0.5 - (T - B) * 0.5;
                    gl_FragColor = vec4(C, 0.0, 0.0, 1.0);
                }`)),
            vorticity: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision highp float;
                precision highp sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_velocity;
                uniform sampler2D u_curl;
                uniform vec2 u_texelSize;
                uniform float u_curl_strength;
                uniform float u_dt;
                void main () {
                    float L = texture2D(u_curl, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
                    float R = texture2D(u_curl, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
                    float T = texture2D(u_curl, v_texcoord + vec2(0.0, u_texelSize.y)).x;
                    float B = texture2D(u_curl, v_texcoord - vec2(0.0, u_texelSize.y)).x;
                    vec2 grad = vec2(R - L, T - B) * 0.5;
                    vec2 vort = vec2(grad.y, -grad.x) * u_curl_strength;
                    vec2 vel = texture2D(u_velocity, v_texcoord).xy;
                    gl_FragColor = vec4(vel + vort * u_dt, 0.0, 1.0);
                }`)),
            divergence: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_velocity;
                uniform vec2 u_texelSize;
                void main () {
                    float L = texture2D(u_velocity, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
                    float R = texture2D(u_velocity, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
                    float T = texture2D(u_velocity, v_texcoord + vec2(0.0, u_texelSize.y)).y;
                    float B = texture2D(u_velocity, v_texcoord - vec2(0.0, u_texelSize.y)).y;
                    float div = 0.5 * (R - L + T - B);
                    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
                }`)),
            clear: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_target;
                uniform float u_value;
                void main () {
                    gl_FragColor = u_value * texture2D(u_target, v_texcoord);
                }`)),
            pressure: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_pressure;
                uniform sampler2D u_divergence;
                uniform vec2 u_texelSize;
                void main () {
                    float L = texture2D(u_pressure, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
                    float R = texture2D(u_pressure, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
                    float T = texture2D(u_pressure, v_texcoord + vec2(0.0, u_texelSize.y)).x;
                    float B = texture2D(u_pressure, v_texcoord - vec2(0.0, u_texelSize.y)).x;
                    float C = texture2D(u_pressure, v_texcoord).x;
                    float div = texture2D(u_divergence, v_texcoord).x;
                    float p = (L + R + T + B - div) * 0.25;
                    gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
                }`)),
            gradientSubtract: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_pressure;
                uniform sampler2D u_velocity;
                uniform vec2 u_texelSize;
                void main () {
                    float L = texture2D(u_pressure, v_texcoord - vec2(u_texelSize.x, 0.0)).x;
                    float R = texture2D(u_pressure, v_texcoord + vec2(u_texelSize.x, 0.0)).x;
                    float T = texture2D(u_pressure, v_texcoord + vec2(0.0, u_texelSize.y)).x;
                    float B = texture2D(u_pressure, v_texcoord - vec2(0.0, u_texelSize.y)).x;
                    vec2 grad = vec2(R - L, T - B) * 0.5;
                    vec2 vel = texture2D(u_velocity, v_texcoord).xy;
                    gl_FragColor = vec4(vel - grad, 0.0, 1.0);
                }`)),
            display: new Program(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, `precision mediump float;
                precision mediump sampler2D;
                varying vec2 v_texcoord;
                uniform sampler2D u_texture;
                void main () {
                    vec3 c = texture2D(u_texture, v_texcoord).rgb;
                    float a = max(c.r, max(c.g, c.b));
                    gl_FragColor = vec4(c, a);
                }`)),
        };
    }

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw gl.getShaderInfoLog(shader);
        return shader;
    }

    function createFBOs(gl, ext) {
        if (!ext.halfFloat) {
            console.error("OES_texture_half_float is not supported on this device.");
            return null;
        }
        if (!ext.formatRGBA) {
            console.error("EXT_color_buffer_float or WEBGL_color_buffer_float is not supported on this device.");
            return null;
        }
        
        const simRes = getResolution(config.SIM_RESOLUTION);
        const dyeRes = getResolution(config.DYE_RESOLUTION);
        
        const texType = ext.halfFloat.HALF_FLOAT_OES;
        const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

        const rgba = gl.RGBA;
        const rg = gl.RGBA; 
        const r = gl.RGBA;

        let dye = createDoubleFBO(gl, dyeRes.width, dyeRes.height, rgba, rgba, texType, filtering);
        let velocity = createDoubleFBO(gl, simRes.width, simRes.height, rg, rg, texType, filtering);
        let divergence = createFBO(gl, simRes.width, simRes.height, r, r, texType, gl.NEAREST);
        let curl = createFBO(gl, simRes.width, simRes.height, r, r, texType, gl.NEAREST);
        let pressure = createDoubleFBO(gl, simRes.width, simRes.height, r, r, texType, gl.NEAREST);

        if (!dye || !velocity || !divergence || !curl || !pressure) {
            console.error("Failed to create one or more Framebuffer Objects. Fluid simulation may not work.");
            return null;
        }

        return { dye, velocity, divergence, curl, pressure };
    }

    function getResolution(resolution) {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        let min = Math.round(resolution);
        let max = Math.round(resolution * aspectRatio);
        if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
        else return { width: min, height: max };
    }

    function createFBO(gl, w, h, internalFormat, format, type, param) {
        gl.activeTexture(gl.TEXTURE0);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);
        let attachment = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (attachment != gl.FRAMEBUFFER_COMPLETE) return null;
        return {
            texture: texture,
            fbo: fbo,
            width: w,
            height: h,
            texelSizeX: 1.0 / w,
            texelSizeY: 1.0 / h,
            attach: function(id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    function createDoubleFBO(gl, w, h, internalFormat, format, type, param) {
        let fbo1 = createFBO(gl, w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(gl, w, h, internalFormat, format, type, param);
        if (!fbo1 || !fbo2) return null;
        return {
            width: w,
            height: h,
            texelSizeX: fbo1.texelSizeX,
            texelSizeY: fbo1.texelSizeY,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap: function() {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        };
    }

    function update() {
        if (!FBOs) return; 
        const dt = Math.min((new Date() - lastUpdateTime) / 1000, 0.0166);
        lastUpdateTime = new Date();

        gl.viewport(0, 0, gltf.width, gltf.height);

        if (splatStack.length > 0)
            multipleSplats(splatStack.pop());

        programs.advection.bind(gl);
        gl.uniform2f(programs.advection.uniforms.u_texelSize, FBOs.velocity.texelSizeX, FBOs.velocity.texelSizeY);
        gl.uniform1i(programs.advection.uniforms.u_velocity, FBOs.velocity.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.u_source, FBOs.velocity.read.attach(0));
        gl.uniform1f(programs.advection.uniforms.u_dt, dt);
        gl.uniform1f(programs.advection.uniforms.u_dissipation, config.VELOCITY_DISSIPATION);
        blit(gl, FBOs.velocity.write.fbo);
        FBOs.velocity.swap();
        
        gl.uniform1i(programs.advection.uniforms.u_velocity, FBOs.velocity.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.u_source, FBOs.dye.read.attach(1));
        gl.uniform1f(programs.advection.uniforms.u_dissipation, config.DENSITY_DISSIPATION);
        blit(gl, FBOs.dye.write.fbo);
        FBOs.dye.swap();

        for (let i = 0; i < pointers.length; i++) {
            const pointer = pointers[i];
            if (pointer.moved) {
                pointer.moved = false;
                splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX, pointer.deltaY, pointer.color);
            }
        }

        programs.curl.bind(gl);
        gl.uniform2f(programs.curl.uniforms.u_texelSize, FBOs.velocity.texelSizeX, FBOs.velocity.texelSizeY);
        gl.uniform1i(programs.curl.uniforms.u_velocity, FBOs.velocity.read.attach(0));
        blit(gl, FBOs.curl.fbo);
        
        programs.vorticity.bind(gl);
        gl.uniform2f(programs.vorticity.uniforms.u_texelSize, FBOs.velocity.texelSizeX, FBOs.velocity.texelSizeY);
        gl.uniform1i(programs.vorticity.uniforms.u_velocity, FBOs.velocity.read.attach(0));
        gl.uniform1i(programs.vorticity.uniforms.u_curl, FBOs.curl.attach(1));
        gl.uniform1f(programs.vorticity.uniforms.u_curl_strength, config.CURL);
        gl.uniform1f(programs.vorticity.uniforms.u_dt, dt);
        blit(gl, FBOs.velocity.write.fbo);
        FBOs.velocity.swap();

        programs.divergence.bind(gl);
        gl.uniform2f(programs.divergence.uniforms.u_texelSize, FBOs.velocity.texelSizeX, FBOs.velocity.texelSizeY);
        gl.uniform1i(programs.divergence.uniforms.u_velocity, FBOs.velocity.read.attach(0));
        blit(gl, FBOs.divergence.fbo);

        programs.clear.bind(gl);
        let pressureTexId = FBOs.pressure.read.attach(0);
        gl.activeTexture(gl.TEXTURE0 + pressureTexId);
        gl.bindTexture(gl.TEXTURE_2D, FBOs.pressure.read.texture);
        gl.uniform1i(programs.clear.uniforms.u_target, pressureTexId);
        gl.uniform1f(programs.clear.uniforms.u_value, config.PRESSURE);
        blit(gl, FBOs.pressure.write.fbo);
        FBOs.pressure.swap();

        programs.pressure.bind(gl);
        gl.uniform2f(programs.pressure.uniforms.u_texelSize, FBOs.velocity.texelSizeX, FBOs.velocity.texelSizeY);
        gl.uniform1i(programs.pressure.uniforms.u_divergence, FBOs.divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(programs.pressure.uniforms.u_pressure, FBOs.pressure.read.attach(1));
            blit(gl, FBOs.pressure.write.fbo);
            FBOs.pressure.swap();
        }

        programs.gradientSubtract.bind(gl);
        gl.uniform2f(programs.gradientSubtract.uniforms.u_texelSize, FBOs.velocity.texelSizeX, FBOs.velocity.texelSizeY);
        gl.uniform1i(programs.gradientSubtract.uniforms.u_pressure, FBOs.pressure.read.attach(0));
        gl.uniform1i(programs.gradientSubtract.uniforms.u_velocity, FBOs.velocity.read.attach(1));
        blit(gl, FBOs.velocity.write.fbo);
        FBOs.velocity.swap();

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        programs.display.bind(gl);
        gl.uniform1i(programs.display.uniforms.u_texture, FBOs.dye.read.attach(0));
        blit(gl, null);
        requestAnimationFrame(update);
    }

    function splat(x, y, dx, dy, color) {
        if (!FBOs) return;
        gl.viewport(0, 0, FBOs.velocity.width, FBOs.velocity.height);
        programs.splat.bind(gl);
        gl.uniform1i(programs.splat.uniforms.u_target, FBOs.velocity.read.attach(0));
        gl.uniform1f(programs.splat.uniforms.u_aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(programs.splat.uniforms.u_point, x, y);
        gl.uniform3f(programs.splat.uniforms.u_color, dx, dy, 0.0);
        gl.uniform1f(programs.splat.uniforms.u_radius, config.SPLAT_RADIUS / 100.0);
        blit(gl, FBOs.velocity.write.fbo);
        FBOs.velocity.swap();

        gl.viewport(0, 0, FBOs.dye.width, FBOs.dye.height);
        gl.uniform1i(programs.splat.uniforms.u_target, FBOs.dye.read.attach(0));
        gl.uniform3fv(programs.splat.uniforms.u_color, color);
        blit(gl, FBOs.dye.write.fbo);
        FBOs.dye.swap();
    }

    function multipleSplats(amount) {
        for (let i = 0; i < amount; i++) {
            const color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
            const x = canvas.width * Math.random();
            const y = canvas.height * Math.random();
            const dx = 1000 * (Math.random() - 0.5);
            const dy = 1000 * (Math.random() - 0.5);
            splat(x / canvas.width, 1.0 - y / canvas.height, dx, dy, color);
        }
    }

    function blit(gl, destination) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (!FBOs) { 
        console.warn("Disabling fluid canvas due to initialization failure.");
        canvas.style.display = 'none';
        return;
    }

    let lastUpdateTime = Date.now();
    
    const isDark = !document.body.classList.contains('light-theme');
    pointers[0].color = isDark ? [0.8, 0.8, 0.8] : [0.05, 0.05, 0.05];

    let lastMouse = { x: 0, y: 0 };
    function updatePointer(e, isMove) {
        const pointer = pointers[0];
        pointer.moved = isMove;
        pointer.texcoordX = e.clientX / canvas.width;
        pointer.texcoordY = 1.0 - e.clientY / canvas.height;
        if (isMove) {
            pointer.deltaX = (e.clientX - lastMouse.x) * 5;
            pointer.deltaY = (e.clientY - lastMouse.y) * -5;
            lastMouse = { x: e.clientX, y: e.clientY };
        }
    }
    
    window.addEventListener('mousemove', e => updatePointer(e, true));
    window.addEventListener('touchmove', e => { e.preventDefault(); updatePointer(e.touches[0], true); }, false);
    window.addEventListener('mousedown', () => pointers[0].down = true);
    window.addEventListener('touchstart', e => { pointers[0].down = true; updatePointer(e.touches[0], true); });
    window.addEventListener('mouseup', () => pointers[0].down = false);
    window.addEventListener('touchend', () => pointers[0].down = false);
    
    new MutationObserver(() => {
        const isDark = !document.body.classList.contains('light-theme');
        pointers[0].color = isDark ? [0.8, 0.8, 0.8] : [0.05, 0.05, 0.05];
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(programs.splat.program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    update();
});
</script>