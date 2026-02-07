--- meta
title: Dreamhack Wargames | Dream Beginners II
date: 2025/09/17
excerpt: Dream Beginners 워게임 풀이 II
categories: Dreamhack, 워게임
---

### Exercise: Welcome-Beginners

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/1.png)

---

#### Write-Up

제공된 서버 정보를 통해 Host와 Port를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/2.png)

<strong>Netcat(nc)</strong>을 활용하면 서버에 접속할 수 있다.  
터미널에서 `nc host8.dreamhack.games 18338`를 입력하여 접속하였다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/3.png)

> **포트 포워딩과 `18338/tcp → 31337/tcp`의 의미**
>
> <strong>포트 포워딩(Port Forwarding)</strong>은 외부 네트워크에서 특정 IP 주소의 지정된 포트로 들어오는 트래픽을 내부 네트워크상의 다른 IP 주소 및 포트로 전달하는 네트워크 기능을 의미한다.  
> 문제에서 제공된 서버는 외부에서 18338번 포트(tcp 프로토콜)를 통해 들어오는 요청을 내부에서 31337번 포트(tcp 프로토콜)로 전달한다. 따라서 서버 접속 시에는 18338번 포트를 사용해야 한다.

이후 `Dreamhack`을 입력하면 플래그가 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/4.png)

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">d6398f06b35117877a855ade8d2015fc3b142c3ca6686ce3198e372b9ef8a644</span>}</span></p>

<br>
<br>
<br>

### Exercise: SSH

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/5.png)

---

#### Write-Up

SSH를 통해 서버에 접속해야 하므로, 터미널에 `ssh chall@[host] -p [port]`의 형식으로 입력한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/6.png)

비밀번호 `dhbgssh`를 입력한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/7.png)

제공된 서버로 원격 접속에 성공하였다. 이후 서버 내에 어떤 파일들이 존재하는지 파악하기 위해 `ls`를 입력하였다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/8.png)

현재 디렉터리에 `flag` 파일이 존재함을 확인하였다. `cat flag`를 입력하여 내용을 확인한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/9.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">h3110_6e9inn3rs!</span>}</span></p>

<br>
<br>
<br>

### Exercise: Docker

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/10.png)

---

#### Write-Up

Docker를 사용하기 위해, 첨부 파일을 다운로드한 뒤 폴더 전체를 리눅스 환경으로 옮긴다.  
이후 터미널 환경에서 해당 디렉터리를 확인해 보면 다음과 같이 `Dockerfile`이 존재함을 확인할 수 있다. 

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/11.png)

`docker build .`를 실행하여 이미지를 빌드한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/12.png)

빌드가 완료되면 `docker images` 명령어를 통해 생성된 이미지를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/13.png)

빌드 시 이미지의 이름과 태그를 지정하지 않았기 때문에 `<none>:<none>` 이미지가 생성되었음을 알 수 있다.  
빌드된 이미지의 `ID`가 `555e1d2f83dd`이므로, `docker run -it 555e1d2f83dd /bin/bash`를 실행하면 해당 이미지로부터 컨테이너를 생성·실행하여 bash 셸을 열 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/14.png)

성공적으로 컨테이너 환경에 접속하였다. 이후 어떤 파일들이 존재하는지 파악하기 위해 `ls`를 입력하였다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/15.png)

현재 디렉터리에 `flag` 파일이 존재함을 확인하였다. `cat flag`를 입력하여 내용을 확인한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/16.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">docker_exercise</span>}</span></p>

<br>
<br>
<br>

### blue-whale

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/17.png)

---

#### Write-Up

분석해야 하는 이미지는 Docker Hub의 `dreamhackofficial/blue-whale` 레포지토리에 위치하며 태그는 `1`이므로, 터미널에 `docker pull dreamhackofficial/blue-whale:1`를 입력한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/18.png)

`docker images`를 실행하면 성공적으로 이미지가 다운로드되었음을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/19.png)

본격적으로 해당 이미지를 분석하기에 앞서, 문제 설명에 포함된 Hint 링크에 접속해 보았다.  

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/20.png)
![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/21.png)

해당 링크는 이미지 분석에 사용되는 도구인 dive의 Github 레포지토리이다.  
기능 설명을 보면 이미지의 콘텐츠를 레이어별로 나타내고, 각 레이어에서 변경된 점을 표시한다고 한다.  
레이어라는 용어가 생소했기에 Docker의 공식 홈페이지를 통해 조사해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/22.png)

도커 이미지는 여러 레이어로 구성되며, 각 레이어는 파일 시스템의 변경 사항을 담고 있다. Dockerfile에 작성한 명령어에 의해 파일이 추가·삭제되는 등 변화가 발생할 때마다 레이어가 생성되는 구조이다.

플래그 파일이 한때 존재했으나 이후 사라졌다는 문제 설명을 고려하면, 이미지를 구성하는 레이어 중 플래그 파일의 삭제가 발생한 레이어가 존재할 것으로 예상된다. 이를 dive를 통해 분석하면 삭제된 파일이 어느 파일인지 확인할 수 있다.

이후 곧바로 dive 설치를 진행하였다. Ubuntu 환경에서의 설치 방법은 README 문서에 안내되어 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/23.png)

ARM64 아키텍쳐용 Ubuntu를 사용 중이므로 `dive_${DIVE_VERSION}_linux_arm64.deb`를 설치하였다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/24.png)

dive는 다음과 같이 간단하게 사용 가능하다. 터미널에 `dive dreamhackofficial/blue-whale:1`를 입력한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/25.png)
![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/26.png)

dive가 실행되면 다음과 같은 화면이 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/27.png)

좌측 상단의 Layers 탭에는 각 레이어가 어떤 명령어에 의해 생성되었는지 표시되며, 우측의 Current Layer Contents 탭에서는 현재 선택된 레이어의 파일 구조를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/28.png)

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

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/29.png)

해당 레이어에서 파일 구조를 확인하면, `/home/chall` 내에 플래그 값을 제목으로 갖는 파일이 생성되었음을 알 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/30.png)

화면에 플래그가 모두 표시되지 않을 경우, `Ctrl + B` 단축키를 사용하여 파일 속성을 숨기면 플래그의 전체 내용을 확인할 수 있다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">b06cb27a502a831822f927562258c6f69b5996a9916206cdb8755cc90ebf3b9f</span>}</span></p>

<br>
<br>
<br>

### ex-reg-ex

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/31.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 입력 양식이 포함된 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/32.png)

특정 정규식 표현과 일치하는 문자열을 입력하면 플래그가 출력되는 구조로 예상된다.  
이후 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.

<img src="/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/33.png" alt="Write-Up" style="padding: 0 10%; background-color: #24292F">

플래그는 `FLAG` 변수에 저장되어 있고, 사용자가 입력한 문자열이 정규식 표현 `r'dr\w{5,7}e\d+am@[a-z]{3,7}\.\w+'`와 일치할 때 출력되는 것을 알 수 있다.

해당 정규식 표현을 해석하면 다음과 같다.

| 패턴          | 의미                         |
|--------------|-----------------------------|
| `dr`         | 문자열 `dr`                   |
| `\w{5,7}`    | 영문자, 숫자, 밑줄(_) 중 5 ~ 7개 |
| `e`          | 문자 `e`                     |
| `\d+`        | 숫자 1개 이상                  |
| `am`         | 문자열 `am`                   |
| `@`          | `@` 문자                     |
| `[a-z]{3,7}` | 알파벳 소문자 3 ~ 7개           |
| `\.`         | 마침표(`.`) 문자               |
| `\w+`        | 영문자, 숫자, 밑줄(_) 중 1개 이상 |

해당 정규식 표현에 맞춰 구성된 예시 입력 문자열은 `draaaaae1am@aaa.a`와 같은 형태가 될 수 있다.  
웹 페이지에서 해당 문자열을 입력해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/34.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">e64a267ab73ae3cea7ff1255b5f08f3e5761defbfa6b99f71cbda74b7a717db3</span>}</span></p>

<br>
<br>
<br>

### phpreg

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/35.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 로그인 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/36.png)

알맞은 Nickname과 Password를 알아내기 위해, 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.  
소스 코드는 다음과 같이 `index.php`와 `step2.php`로 구성되어 있다. CSS 관련 코드는 생략하였다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/37.png)
![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/38.png)

`index.php`의 소스 코드를 보면 로그인 양식을 `step2.php`로 제출한다는 것을 알 수 있다.
`step2.php`에는 사용자 입력값을 받아 로그인을 처리하는 PHP 코드가 포함되어 있다.  

구체적인 로그인 처리 절차는 다음과 같다.

```php
if (preg_match("/[a-zA-Z]/", $input_pw)) {
  echo "alphabet in the pw :(";
} else {
  ...
}
```

우선 위의 조건문에 의해 Password에는 알파벳을 포함시킬 수 없다.

```php
$name = preg_replace("/nyang/i", "", $input_name);
$pw = preg_replace("/\d*\@\d{2,3}(31)+[^0-8\"]\!/", "d4y0r50ng", $input_pw);
```

`else` 문 내의 코드는 위와 같이 시작한다.  
Nickname에 `nyang`(대소문자 불구분) 문자열이 포함될 경우, 이를 빈 문자열로 치환한다.
Password의 경우, 정규식 표현 `/\d*\@\d{2,3}(31)+[^0-8\"]\!/`에 해당하는 문자열을 `d4y0r50ng`로 치환한다. 해당 필터링 정규식 표현을 해석하면 다음과 같다.

| 패턴        | 의미                                    |
|------------|----------------------------------------|
| `\d*`      | 숫자 0개 이상                             |
| `\@`       | `@` 문자                                |
| `\d{2,3}`  | 숫자 2 ~ 3개                             |
| `(31)+`    | 문자열 `31` 1개 이상                       |
| `[^0-8\"]` | `0 - 8` 범위의 숫자 및 `"` 문자를 제외한 나머지 |
| `\!`       | `!` 문자                                |

```php
if ($name === "dnyang0310" && $pw === "d4y0r50ng+1+13") {
  echo '
  <h4>Step 2 : Almost done...</h4>
  <div class="door_box">
    <div class="door_black"></div>
    <div class="door">
      <div class="door_cir"></div>
    </div>
  </div>';
  ...
}
```

Nickname과 Password를 각각 치환한 결과가 `dnyang0310`, `d4y0r50ng+1+13`인 경우 조건문을 통과하며 `Step 2: Almost done...`이 출력된다.
조건문 통과를 위한 알맞은 Nickname과 Password값의 예시는 다음과 같다.

| Nickname          | Password       |
|-------------------|----------------|
| `dnynyangang0310` | `@11319!+1+13` |

```php
$cmd = $_POST["cmd"] ? $_POST["cmd"] : "";

if ($cmd === "") {
  echo '
    <p>
      <form method="post" action="/step2.php">
        <input type="hidden" name="input1" value="'.$input_name.'">
        <input type="hidden" name="input2" value="'.$input_pw.'">
        <input type="text" placeholder="Command" name="cmd">
        <input type="submit" value="제출">
        <br/><br/>
      </form>
    </p>
  ';
}
// cmd filtering
else if (preg_match("/flag/i", $cmd)) {
  echo "<pre>Error!</pre>";
} else {
  echo "<pre>--Output--\n";
  system($cmd);
  echo "</pre>";
}
```

이후 서버는 POST 요청으로 전달받은 `cmd` 파라미터를 확인하며, 값이 없을 경우 조건문을 통과하여 새로운 입력 양식을 생성한다. 해당 양식은 `cmd` 값을 `step2.php`로 제출하도록 설정되어 있다.  
첫 로그인 시에는 `cmd` 값이 없기 때문에 반드시 입력 양식이 생성되고, 이후 `cmd` 값을 제출하면 `else if` 문으로 흐름이 넘어간다. 이때 `cmd` 값에 `flag`(대소문자 불구분)가 존재하면 에러가 발생하며, 그렇지 않으면 `system($cmd)`을 통해 해당 명령어가 실행된다.

플래그는 `../dream/flag.txt` 위치에 존재하므로, 제한 조건을 우회하여 명령을 실행시키기 위해서는 `cat ../dream/fla?.txt` 등을 사용할 수 있다.

플래그 출력을 위한 방법이 정리되었으므로, 웹 페이지로 이동하여 `dnynyangang0310`/`@11319!+1+13`를 입력해 보자.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/39.png)

예상대로 `Step 2: Almost done...`가 출력되며 명령어 입력 양식이 생성되었다. `cat ../dream/fla?.txt`를 입력한다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/40.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">ad866c64dabaf30136e22d3de2980d24c4da617b9d706f81d10a1bc97d0ab6f6</span>}</span></p>

<br>
<br>
<br>

### dreamhack-tools-cyberchef

#### Description

![Description](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/41.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `index.html` 파일을 확인할 수 있다.  
파일을 열람하면 다음과 같은 화면이 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/42.png)

출력된 문자열은 플래그를 Rail Fence 암호화 → Base64 인코딩 → ROT13 암호화한 값에 해당한다. 따라서 역순으로 ROT13 복호화 → Base64 디코딩 → Rail Fence 복호화를 수행하면 플래그를 획득할 수 있다. 

Dreamhack Tools의 Cyberchef를 활용하면 여러 종류의 인코딩/디코딩, 암호화/복호화를 한 번에 수행할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20%7C%20Dream%20Beginners%20II/43.png)

올바른 순서로 복호화 및 디코딩을 진행하여 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">cyberchef-tools-encoderwwowowowo!!!</span>}</span></p>