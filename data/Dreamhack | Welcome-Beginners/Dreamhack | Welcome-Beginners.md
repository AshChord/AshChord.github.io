--- meta
title: Dreamhack | Welcome-Beginners
date: 2025/07/26
excerpt: Welcome-Beginners 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: Welcome-Beginners

![Description](/data/Dreamhack%20|%20Welcome-Beginners/1.png)

<br>
<br>
<br>

### Write-Up

제공된 서버 정보를 통해 Host와 Port를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20|%20Welcome-Beginners/2.png)

<strong>Netcat(nc)</strong>을 활용하면 서버에 접속할 수 있다.  
터미널에서 `nc host8.dreamhack.games 18338`를 입력하여 접속하였다.

![Write-Up](/data/Dreamhack%20|%20Welcome-Beginners/3.png)

> **포트 포워딩과 `18338/tcp → 31337/tcp`의 의미**
>
> <strong>포트 포워딩(Port Forwarding)</strong>은 외부 네트워크에서 특정 IP 주소의 지정된 포트로 들어오는 트래픽을 내부 네트워크상의 다른 IP 주소 및 포트로 전달하는 네트워크 기능을 의미한다.  
> 문제에서 제공된 서버는 외부에서 18338번 포트(tcp 프로토콜)를 통해 들어오는 요청을 내부에서 31337번 포트(tcp 프로토콜)로 전달한다. 따라서 서버 접속 시에는 18338번 포트를 사용해야 한다.

이후 `Dreamhack`을 입력하면 플래그가 출력된다.

![Write-Up](/data/Dreamhack%20|%20Welcome-Beginners/4.png)

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">d6398f06b35117877a855ade8d2015fc3b142c3ca6686ce3198e372b9ef8a644</span>}</span></p>