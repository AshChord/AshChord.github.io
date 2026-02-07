--- meta
title: Dreamhack Wargames | Dream Beginners I
date: 2025/09/14
excerpt: Dream Beginners 워게임 풀이 I
categories: Dreamhack, 워게임
---

### Introduction to Dreamhack

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/1.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `flag.txt` 파일을 확인할 수 있다.  
파일을 열람하면 플래그가 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/2.png)

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">21008c3ae798aac87cc4939917b855b54b5a5799</span>}</span></p>

<br>
<br>
<br>

### 64se64

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/3.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `index.html` 파일을 확인할 수 있다.  
소스 코드를 살펴 보면 숨겨진 `<input>` 태그의 `value` 속성에 Base64 인코딩된 것으로 보이는 문자열이 지정되어 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/4.png)

해당 문자열을 Base64 디코딩하면 다음과 같은 파이썬 스크립트를 획득할 수 있다.

```python
#!/usr/bin/env python3
asc=[68, 72, 123, 98, 101, 48, 52, 54, 98, 55, 53, 50, 50, 97, 97, 50, 101, 50, 56,
102, 50, 55, 54, 101, 48, 99, 57, 49, 48, 53, 50, 49, 102, 50, 51, 97, 48, 53, 56, 55, 48, 48, 53, 97, 56, 51, 55, 55, 51, 55, 48, 97, 49, 49, 101, 53, 101, 52, 100, 99, 49, 53, 102, 98, 50, 97, 98, 125]
arr=[0 for i in range(68)]
for i in range(0,68):
    arr[i]=chr(asc[i])
flag=''.join(arr)
print(flag)
```

위의 스크립트는 `asc` 리스트에 담긴 아스키 코드 값들을 문자로 변환한 뒤, 이를 순서대로 이어 붙여 최종 문자열을 생성하고 출력하는 코드이다. 스크립트를 실행하면 다음과 같이 플래그가 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/5.png)

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">be046b7522aa2e28f276e0c910521f23a0587005a8377370a11e5e4dc15fb2ab</span>}</span></p>

<br>

> **셔뱅과 `#!/usr/bin/env python3`의 의미**
>
> <strong>셔뱅(Shebang, `#!`)</strong>은 Sharp(`#`)와 Bang(`!`)의 합성어로, 스크립트 파일의 첫 줄에 위치하는 특별한 문자 조합이다. Unix 계열 운영 체제에서 해당 스크립트를 실행할 인터프리터의 절대 경로를 지시하는 역할을 수행한다.
>
> 사용 예시는 다음과 같다.
> ```python
> #!/usr/bin/python3
> ```
> 위와 같은 지시문이 포함된 스크립트는 `/usr/bin/python3` 경로에 위치한 `python3` 인터프리터를 이용해 실행된다. 하지만 사용하는 시스템마다 `python3` 인터프리터가 설치된 위치가 다를 수 있어, 주로 다음과 같은 형태로 사용한다.
> ```python
> #!/usr/bin/env python3
> ```
> `/usr/bin/env`는 환경 변수(`PATH`)를 참조하여 실행 파일을 찾는 유틸리티 프로그램(`env` 명령어)이다. 운영 체제는 해당 지시문에 의해 현재 환경 변수에서 `python3` 실행 파일을 찾아 스크립트를 실행하게 되며, 다양한 환경에서 같은 스크립트가 유연하게 실행될 수 있다.

<br>
<br>
<br>

### baby-linux

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/6.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 입력 양식이 포함된 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/7.png)

`$(...)`는 괄호 내 명령어의 실행 결과를 문자열로 치환하는 구문이다. 이를 `echo` 명령어로 출력하여, Result 칸에 표시하는 구조로 보인다. 예시로 `ls` 명령어를 입력해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/8.png)

`ls` 명령어의 실행 결과로 현재 디렉터리에 존재하는 파일 및 디렉터리 목록이 출력되었다. 이 중 `hint.txt`에 문제 풀이를 위한 힌트가 존재할 것으로 추측되어 `cat hint.txt`를 입력해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/9.png)

플래그가 `./dream/hack/hello` 경로에 위치함을 확인하였다. 따라서 `ls ./dream/hack/hello`를 입력하여 어떤 파일이 존재하는지 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/10.png)

해당 경로에 `flag.txt` 파일이 존재함을 확인하였다. 이어서 `cat ./dream/hack/hello/flag.txt`를 입력하여 파일 내용 열람을 시도하였다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/11.png)

그러자 `No!`라는 메시지가 출력되었다. `flag.txt`의 내용이 `No!`일 가능성은 낮으므로, 단순한 방법으로는 파일 내용을 확인할 수 없도록 처리되어 있는 듯했다. 정확한 서버 측 동작을 알아 내기 위해 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.

<img src="/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/12.png" alt="Write-Up" style="padding: 0 10%; background-color: #24292F">

첨부 파일을 다운로드하고 압축을 해제하면 `app.py` 파일을 확인할 수 있다. 참고로 웹 페이지에서 `cat app.py`를 입력해도 동일한 소스 코드가 출력된다.

코드를 살펴 보면 Python의 웹 프레임워크인 Flask를 사용해 개발된 웹 서비스임을 확인할 수 있다.  
Flask를 사용한 경험이 없는 관계로, 구글링을 통해 해당 코드의 작동 방식을 파악해 보았다.

Flask를 사용할 때는 먼저 `Flask` 모듈을 임포트하고, `Flask` 객체를 생성하여 `app` 변수에 할당한다. 이후 `@app.route()` 데코레이터로 URL 라우팅 경로를 설정하고, 해당 요청에 대한 응답을 처리할 함수를 정의한다.

위의 코드에서는 루트 주소(`/`)로 들어오는 요청을 처리하는 함수 `index()`가 정의되어 있다.  
`index()` 함수는 기본적으로 `index.html`을 반환한다. 그러나 POST 요청(사용자가 입력 양식을 통해 값 제출)을 수신한 경우, `index()`는 사용자 입력값을 받아 `echo $(...)` 형태의 명령어를 쉘에서 실행한 뒤 `result`에 그 결과를 지정하여 `index.html`을 반환한다.

> **`subprocess`**: Python에서 외부 명령어를 실행시키는 모듈  
> **`subprocess.check_output()`**: 명령의 출력 값을 반환하는 함수  
> **`/bin/sh`**: 리눅스의 기본 쉘 프로그램  
> **`-c`**: 쉘 명령어를 문자열로 전달하여 실행시키는 옵션

중요한 것은, POST 요청을 처리하는 과정에서 `cmd` 변수에 `'flag'`라는 문자열이 포함되는 경우 `result`에 `No!`를 지정하는 조건문이 존재한다는 점이다. 이 조건문에 의해 `cat ./dream/hack/hello/flag.txt`과 같은 명령어로는 해당 파일의 내용을 출력할 수 없다.

이를 우회하기 위한 방법으로 와일드카드의 사용을 고려할 수 있다. `*`는 `a-z`, `0-9` 범위 내의 0개 이상 문자를 대체할 수 있으므로, 웹 페이지에서 `cat ./dream/hack/hello/*.txt`를 대신 입력해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20I/13.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">671ce26c70829e716fae26c7c71a33823feb479f2562891f64605bf68f60ae54</span>}</span></p>