--- meta
title: Dreamhack | SSH
date: 2025/07/27
excerpt: SSH 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: SSH

![Description](/data/Dreamhack%20|%20SSH/1.png)

<br>
<br>
<br>

### Write-Up

SSH를 통해 서버에 접속해야 하므로, 터미널에 `ssh chall@[host] -p [port]`의 형식으로 입력한다.

![Write-Up](/data/Dreamhack%20|%20SSH/2.png)

비밀번호 `dhbgssh`를 입력한다.

![Write-Up](/data/Dreamhack%20|%20SSH/3.png)

제공된 서버로 원격 접속에 성공하였다. 이후 서버 내에 어떤 파일들이 존재하는지 파악하기 위해 `ls`를 입력하였다.

![Write-Up](/data/Dreamhack%20|%20SSH/4.png)

현재 디렉터리에 `flag` 파일이 존재함을 확인하였다. `cat flag`를 입력하여 내용을 확인한다.

![Write-Up](/data/Dreamhack%20|%20SSH/5.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">h3110_6e9inn3rs!</span>}</span></p>