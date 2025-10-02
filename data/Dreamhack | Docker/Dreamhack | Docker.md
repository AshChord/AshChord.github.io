--- meta
title: Dreamhack | Docker
date: 2025/07/28
excerpt: Docker 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: Docker

![Description](/data/Dreamhack%20|%20Docker/1.png)

<br>
<br>
<br>

### Write-Up

Docker를 사용하기 위해, 첨부 파일을 다운로드한 뒤 폴더 전체를 리눅스 환경으로 옮긴다.  
이후 터미널 환경에서 해당 디렉터리를 확인해 보면 다음과 같이 `Dockerfile`이 존재함을 확인할 수 있다. 

![Write-Up](/data/Dreamhack%20|%20Docker/2.png)

`docker build .`를 실행하여 이미지를 빌드한다.

![Write-Up](/data/Dreamhack%20|%20Docker/3.png)

빌드가 완료되면 `docker images` 명령어를 통해 생성된 이미지를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20|%20Docker/4.png)

빌드 시 이미지의 이름과 태그를 지정하지 않았기 때문에 `<none>:<none>` 이미지가 생성되었음을 알 수 있다.  
빌드된 이미지의 `ID`가 `555e1d2f83dd`이므로, `docker run -it 555e1d2f83dd /bin/bash`를 실행하면 해당 이미지로부터 컨테이너를 생성·실행하여 bash 셸을 열 수 있다.

![Write-Up](/data/Dreamhack%20|%20Docker/5.png)

성공적으로 컨테이너 환경에 접속하였다. 이후 어떤 파일들이 존재하는지 파악하기 위해 `ls`를 입력하였다.

![Write-Up](/data/Dreamhack%20|%20Docker/6.png)

현재 디렉터리에 `flag` 파일이 존재함을 확인하였다. `cat flag`를 입력하여 내용을 확인한다.

![Write-Up](/data/Dreamhack%20|%20Docker/7.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">docker_exercise</span>}</span></p>