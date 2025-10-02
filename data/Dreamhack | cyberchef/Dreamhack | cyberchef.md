--- meta
title: Dreamhack | cyberchef
date: 2025/08/01
excerpt: cyberchef 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: cyberchef

![Description](/data/Dreamhack%20|%20cyberchef/1.png)

<br>
<br>
<br>

### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `index.html` 파일을 확인할 수 있다.  
파일을 열람하면 다음과 같은 화면이 출력된다.

![Write-Up](/data/Dreamhack%20|%20cyberchef/2.png)

출력된 문자열은 플래그를 Rail Fence 암호화 → Base64 인코딩 → ROT13 암호화한 값에 해당한다. 따라서 역순으로 ROT13 복호화 → Base64 디코딩 → Rail Fence 복호화를 수행하면 플래그를 획득할 수 있다. 

Dreamhack Tools의 Cyberchef를 활용하면 여러 종류의 인코딩/디코딩, 암호화/복호화를 한 번에 수행할 수 있다.

![Write-Up](/data/Dreamhack%20|%20cyberchef/3.png)

올바른 순서로 복호화 및 디코딩을 진행하여 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">cyberchef-tools-encoderwwowowowo!!!</span>}</span></p>