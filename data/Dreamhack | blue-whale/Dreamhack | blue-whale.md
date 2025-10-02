--- meta
title: Dreamhack | blue-whale
date: 2025/07/29
excerpt: blue-whale 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: blue-whale

![Description](/data/Dreamhack%20|%20blue-whale/1.png)

<br>
<br>
<br>

### Write-Up

분석해야 하는 이미지는 Docker Hub의 `dreamhackofficial/blue-whale` 레포지토리에 위치하며 태그는 `1`이므로, 터미널에 `docker pull dreamhackofficial/blue-whale:1`를 입력한다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/2.png)

`docker images`를 실행하면 성공적으로 이미지가 다운로드되었음을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/3.png)

본격적으로 해당 이미지를 분석하기에 앞서, 문제 설명에 포함된 Hint 링크에 접속해 보았다.  

![Write-Up](/data/Dreamhack%20|%20blue-whale/4.png)
![Write-Up](/data/Dreamhack%20|%20blue-whale/5.png)

해당 링크는 이미지 분석에 사용되는 도구인 dive의 Github 레포지토리이다.  
기능 설명을 보면 이미지의 콘텐츠를 레이어별로 나타내고, 각 레이어에서 변경된 점을 표시한다고 한다.  
레이어라는 용어가 생소했기에 Docker의 공식 홈페이지를 통해 조사해 보았다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/6.png)

도커 이미지는 여러 레이어로 구성되며, 각 레이어는 파일 시스템의 변경 사항을 담고 있다. Dockerfile에 작성한 명령어에 의해 파일이 추가·삭제되는 등 변화가 발생할 때마다 레이어가 생성되는 구조이다.

플래그 파일이 한때 존재했으나 이후 사라졌다는 문제 설명을 고려하면, 이미지를 구성하는 레이어 중 플래그 파일의 삭제가 발생한 레이어가 존재할 것으로 예상된다. 이를 dive를 통해 분석하면 삭제된 파일이 어느 파일인지 확인할 수 있다.

이후 곧바로 dive 설치를 진행하였다. Ubuntu 환경에서의 설치 방법은 README 문서에 안내되어 있다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/7.png)

ARM64 아키텍쳐용 Ubuntu를 사용 중이므로 `dive_${DIVE_VERSION}_linux_arm64.deb`를 설치하였다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/8.png)

dive는 다음과 같이 간단하게 사용 가능하다. 터미널에 `dive dreamhackofficial/blue-whale:1`를 입력한다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/9.png)
![Write-Up](/data/Dreamhack%20|%20blue-whale/10.png)

dive가 실행되면 다음과 같은 화면이 나타난다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/11.png)

좌측 상단의 Layers 탭에는 각 레이어가 어떤 명령어에 의해 생성되었는지 표시되며, 우측의 Current Layer Contents 탭에서는 현재 선택된 레이어의 파일 구조를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/12.png)

각 레이어를 탐색하던 도중 다음 3개의 명령을 확인하였다.

<pre><code class="language-dockerfile hljs" data-highlighted="yes"><span class="hljs-keyword">WORKDIR</span> /home/chall
<span class="hljs-keyword">RUN</span> /bin/sh -c <span class="hljs-built_in">touch</span> <span class="hljs-string">`python3 -c "print(open('./flag', 'r').read())"`</span>
<span class="hljs-keyword">RUN</span> /bin/sh -c <span class="hljs-built_in">rm</span> <span class="hljs-number">*</span>
</code></pre>

각 명령의 동작을 요약하면 다음과 같다.

- 작업 디렉터리를 `/home/chall`로 설정
- `print(open('./flag', 'r').read())`의 실행 결과(`flag` 파일의 내용)를 파일명으로 하여 빈 파일 생성
- 현재 디렉터리(`/home/chall`)에서 모든 파일 삭제

예상대로, 이미지 빌드 도중 플래그 파일을 삭제하는 작업이 존재했다. 따라서 파일이 삭제되기 직전 <code>RUN /bin/sh -c touch \`python3 -c "print(open('./flag', 'r').read())"\`</code> 명령에 의해 생성된 레이어를 살펴보면, `/home/chall` 디렉터리 내에 플래그 값을 제목으로 갖는 파일이 존재할 것이다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/13.png)

해당 레이어에서 파일 구조를 확인하면, `/home/chall` 내에 플래그 값을 제목으로 갖는 파일이 생성되었음을 알 수 있다.

![Write-Up](/data/Dreamhack%20|%20blue-whale/14.png)

화면에 플래그가 모두 표시되지 않을 경우, `Ctrl + B` 단축키를 사용하여 파일 속성을 숨기면 플래그의 전체 내용을 확인할 수 있다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">b06cb27a502a831822f927562258c6f69b5996a9916206cdb8755cc90ebf3b9f</span>}</span></p>