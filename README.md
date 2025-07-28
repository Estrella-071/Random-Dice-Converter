<div align="center">

[繁體中文](README/README.zh-TW.md) | [简体中文](README/README.zh-CN.md) | English | [日本語](README/README.ja.md) | [한국어](README/README.ko.md)

</div>
---

# Co-op Mode Converter for Random Dice Defense : PvP

A high-performance web application designed for "Random Dice: PvP Defense" players, aimed at providing convenient co-op mode output conversions and data visualization features.

![Project Screenshot](assets/screenshot_en01.png)
![Project Screenshot](assets/screenshot_en02.png)

---
## Features

This tool implements bidirectional data conversion and analysis based on the in-game output rules for various wave intervals, powered by specific algorithms.

#### **Conversion Modes**
* **Waves ❯ Cards**: Input a specific wave number, and the tool will accurately calculate the total number of cards obtainable up to that wave based on the cumulative formula `C(W) = Σ c(w)`.
* **Cards ❯ Waves**: Input a target card count, and the tool will efficiently calculate the minimum number of waves required to achieve that target using a Binary Search algorithm.
* **Resources ❯ Waves**: Input an amount of Gold or Diamonds, and it will be converted into the corresponding number of cards and the equivalent number of waves.

#### **Advanced Features & Interactions**
* **Result Interactions**:
    * **Range Calculation**: Supports dragging one result item onto another in the results panel to quickly calculate the difference between them.
    * **Reward Details**: Click on any card number to instantly calculate the expected value of Common, Rare, Heroic, and Legendary dice, as well as the amount of Gold and Diamonds from the corresponding card boxes based on player rank.
    * **Multi-Copy**: Allows for copying multiple result entries at once.
* **Data Visualization Chart**:
    * Provides an interactive chart to visualize the non-linear growth relationship between waves and cards.
* **Other Functions**:
    * **History**: Automatically caches recent queries for easy review.
    * **Common Tables**: Includes pre-populated tables for frequently referenced values.

---
## Tech Stack

* **Frontend**: `HTML5`, `CSS3`, `JavaScript (ES6+)`
* **Charting**: `Chart.js`
* **Animation**: `GSAP (GreenSock Animation Platform)`

---