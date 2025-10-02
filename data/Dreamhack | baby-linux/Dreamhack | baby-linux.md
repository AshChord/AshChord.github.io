--- meta
title: Dreamhack | baby-linux
date: 2025/07/25
excerpt: baby-linux 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 리눅스 사용법 한 눈에 살펴보기  
**[Wargame]**: baby-linux

![Description](/data/Dreamhack%20|%20baby-linux/1.png)

<br>
<br>
<br>

### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 입력 양식이 포함된 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20|%20baby-linux/2.png)

`$(...)`는 괄호 내 명령어의 실행 결과를 문자열로 치환하는 구문이다. 이를 `echo` 명령어로 출력하여, Result 칸에 표시하는 구조로 보인다. 예시로 `ls` 명령어를 입력해 보았다.

![Write-Up](/data/Dreamhack%20|%20baby-linux/3.png)

`ls` 명령어의 실행 결과로 현재 디렉터리에 존재하는 파일 및 디렉터리 목록이 출력되었다. 이 중 `hint.txt`에 문제 풀이를 위한 힌트가 존재할 것으로 추측되어 `cat hint.txt`를 입력해 보았다.

![Write-Up](/data/Dreamhack%20|%20baby-linux/4.png)

플래그가 `./dream/hack/hello` 경로에 위치함을 확인하였다. 따라서 `ls ./dream/hack/hello`를 입력하여 어떤 파일이 존재하는지 확인해 보았다.

![Write-Up](/data/Dreamhack%20|%20baby-linux/5.png)

해당 경로에 `flag.txt` 파일이 존재함을 확인하였다. 이어서 `cat ./dream/hack/hello/flag.txt`를 입력하여 파일 내용 열람을 시도하였다.

![Write-Up](/data/Dreamhack%20|%20baby-linux/6.png)

그러자 `No!`라는 메시지가 출력되었다. `flag.txt`의 내용이 `No!`일 가능성은 낮으므로, 단순한 방법으로는 파일 내용을 확인할 수 없도록 처리되어 있는 듯했다. 정확한 서버 측 동작을 알아 내기 위해 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.

<img src="/data/Dreamhack%20|%20baby-linux/7.png" alt="Write-Up" style="padding: 0 10%; background-color: #24292F">

첨부 파일을 다운로드하고 압축을 해제하면 `app.py` 파일을 확인할 수 있다. 참고로 웹 페이지에서 `cat app.py`를 입력해도 동일한 소스 코드가 출력된다.

코드를 살펴 보면 Python의 웹 프레임워크인 Flask를 사용해 개발된 웹 서비스임을 확인할 수 있다.  
Flask를 사용한 경험이 없는 관계로, 구글링을 통해 해당 코드의 작동 방식을 파악해 보았다.

Flask를 사용할 때는 먼저 `Flask` 모듈을 임포트하고, `Flask` 객체를 생성하여 `app` 변수에 할당한다. 이후 `@app.route()` 데코레이터로 URL 라우팅 경로를 설정하고, 해당 요청에 대한 응답을 처리할 함수를 정의한다.

위의 코드에서는 루트 주소(`/`)로 들어오는 요청을 처리하는 함수 `index()`가 정의되어 있다.  
`index()` 함수는 기본적으로 `index.html`을 반환한다. 그러나 POST 요청(사용자가 입력 양식을 통해 값 제출)을 수신한 경우, `index()`는 사용자 입력값을 받아 `echo $(...)` 형태의 명령어를 쉘에서 실행한 뒤 `result`에 그 결과를 지정하여 `index.html`을 반환한다.

> `subprocess`: Python에서 외부 명령어를 실행시키는 모듈  
> `subprocess.check_output()`: 명령의 출력 값을 반환하는 함수  
> `/bin/sh`: 리눅스의 기본 쉘 프로그램  
> `-c`: 쉘 명령어를 문자열로 전달하여 실행시키는 옵션

중요한 것은, POST 요청을 처리하는 과정에서 `cmd` 변수에 `'flag'`라는 문자열이 포함되는 경우 `result`에 `No!`를 지정하는 조건문이 존재한다는 점이다. 이 조건문에 의해 `cat ./dream/hack/hello/flag.txt`과 같은 명령어로는 해당 파일의 내용을 출력할 수 없다.

이를 우회하기 위한 방법으로 와일드카드의 사용을 고려할 수 있다. `*`는 `a-z`, `0-9` 범위 내의 0개 이상 문자를 대체할 수 있으므로, 웹 페이지에서 `cat ./dream/hack/hello/*.txt`를 대신 입력해 보았다.

![Write-Up](/data/Dreamhack%20|%20baby-linux/8.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">671ce26c70829e716fae26c7c71a33823feb479f2562891f64605bf68f60ae54</span>}</span></p>