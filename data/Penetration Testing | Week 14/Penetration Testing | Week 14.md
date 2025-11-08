--- meta
title: Penetration Testing | Week 14
date: 2025/07/13
excerpt: 파일 업로드 취약점
categories: 모의 해킹
---

### 강의 노트

#### 파일 업로드 취약점

<strong>파일 업로드 취약점(File Upload Vulnerability)</strong>은 웹 애플리케이션이 사용자가 업로드하는 파일에 대해 별도의 검증을 하지 않을 때 발생하는 취약점이다. 이 취약점을 악용하면 공격자는 악성 파일을 업로드하고 이를 웹 서버에서 실행시킬 수 있어 심각한 보안 위협으로 이어질 수 있다.

<br>

##### 주요 공격 유형

다음은 파일 업로드 취약점을 악용하여 수행할 수 있는 주요 공격 유형이다.

**1. 서버 장악**  
: 업로드된 <strong>웹 셸(Web Shell)</strong> 등을 통해 명령어를 실행하거나 시스템에 접근함으로써 서버를 제어한다.

**2. 피싱(Phising)**  
: 정교하게 제작된 피싱 페이지를 업로드하여 사용자 정보를 탈취한다. 예를 들어, 로그인 페이지를 위장해 사용자 인증 정보를 수집할 수 있다.

**3. 디페이스(Deface) 공격**  
: `index` 파일을 변경하여 웹 사이트의 메인 페이지나 특정 콘텐츠를 덮어씀으로써 정치적 메시지 등을 노출시키는 공격으로, 웹 사이트의 신뢰도에 큰 타격을 줄 수 있다.

**4. XSS 공격**  
: 악성 스크립트가 포함된 파일을 업로드하고 실행시켜, 사용자 브라우저에서 자바스크립트가 실행되도록 XSS 공격을 연계한다.

**5. 서비스 거부 공격(Denial of Service, DoS)**  
: 매우 큰 파일이나 특정한 포맷의 파일을 다량 업로드하여 서버의 저장 공간이나 자원을 소진시키고, 서비스 가용성을 저하시킨다.

<br>

##### 웹 셸

파일 업로드 취약점을 활용한 대표적인 공격인 **웹 셸**에 대해 학습해 보자.

<strong>셸(Shell)</strong>이란 사용자와 운영 체제 사이의 인터페이스를 의미하는 용어로, 사용자가 명령어를 입력하면 셸이 이를 해석하고 운영 체제에 전달하여 명령을 실행시키는 역할을 한다. macOS의 터미널이 대표적인 예시이다.  
웹 셸은 웹을 통해 서버에 명령을 전달하고 실행할 수 있게 만든 악성 셸을 뜻한다. 다음의 예시를 보자.

```php
// webshell.php

<?php
  // system(): 매개 변수로 전달된 셸 명령어를 실행한 뒤 결과를 출력하는 함수
  system($_GET['cmd']);
?>
```

게시판과 같이 파일 업로드가 가능한 웹 애플리케이션 기능을 통해 위의 `webshell.php` 파일을 업로드했다고 가정해 보자. 서버는 이를 `/var/www/html/uplaods/`와 같은 경로에 저장하고, 사용자가 브라우저에서 해당 파일에 접근할 때는 `http://example.com/uploads/webshell.php`와 같은 URL을 사용한다.

`system()` 함수에 전달되는 인자는 URL의 쿼리 스트링에 포함된 `cmd` 파라미터의 값이므로, `http://example.com/uploads/webshell.php?cmd=ls`와 같은 URL로 접근하면 웹 서버는 `ls` 명령어(현재 디렉토리 내 파일 및 폴더 목록 조회)를 실행하고 브라우저에 결과를 출력한다. 즉, 공격자는 웹 서버에 원하는 명령을 실행시킬 수 있고, 따라서 서버를 원격으로 제어할 수 있게 된다.

웹 셸을 활용한 공격에는 두 가지 핵심 사항이 존재한다. 먼저 **웹 서버에서 실행되는 코드가 포함된 파일을 업로드**할 수 있어야 하며, 이후 **업로드한 파일의 경로를 파악**할 수 있어야 한다. 실제로 웹 셸을 업로드하는 예시와 함께 살펴 보자.

![Web Shell](/data/Penetration%20Testing%20%7C%20Week%2014/1.png)

파일 업로드 기능이 포함된 간단한 게시판 애플리케이션이다. 앞서 작성했던 `webshell.php` 파일을 업로드해 보자.

![Web Shell](/data/Penetration%20Testing%20%7C%20Week%2014/2.png)
![Web Shell](/data/Penetration%20Testing%20%7C%20Week%2014/3.png)

파일을 업로드한 후 게시물을 열람하면 첨부 파일 다운로드 링크가 표시되며, 개발자 도구를 통해 해당 요소를 확인해 보면 `<a href="./download.php?file=webshell.php&target_Dir=./file/uploads">다운로드</a>`와 같은 형태임을 알 수 있다. `href` 속성에 지정된 URL을 살펴 보면 쿼리 스트링에 `target_Dir` 파라미터가 포함되어 있어 업로드한 파일이 저장된 디렉토리가 `./file/uploads`임을 유추할 수 있다.

파일의 경로를 파악했으므로, 주소 창에 `http://ctf.segfaulthub.com:9992/file/uploads/webshell.php`를 입력하면 해당 파일에 접근할 수 있다. 웹 서버에서 `ls` 명령어를 실행시키기 위해 `cmd=ls` 쿼리스트링을 추가하고 접속해 보자.

![Web Shell](/data/Penetration%20Testing%20%7C%20Week%2014/4.png)

웹 서버의 현재 경로(`./file/uploads`)에 존재하는 파일 목록들이 출력됨을 확인하였다.

이처럼 웹 애플리케이션이 파일 업로드 기능과 업로드한 파일의 경로를 확인할 수 있는 구조를 갖추고 있다면 웹 셸을 활용한 공격을 수행할 수 있다.

---

#### 파일 업로드 공격 대응 방안 및 우회 기법

##### MIME 타입 검사

**MIME(Multipurpose Internet Mail Extensions) 타입**은 파일 또는 데이터가 어떤 종류의 콘텐츠인지를 나타내는 표준 형식을 말한다. 예시로 HTML 문서의 경우 `text/html`, PNG 이미지의 경우 `image/png`와 같은 형태로 나타낸다.

파일 업로드 취약점을 막기 위한 기본적인 접근 방식 중 하나는, 서버 측에서 특정 형식의 파일만을 업로드할 수 있도록 제한하는 것이다. 예를 들어 게시판의 파일 업로드 기능이 이미지 첨부 용도로만 사용된다면, 서버는 파일의 MIME 타입이 `image/jpeg`, `image/png` 등 이미지에 해당하는 경우만을 허용하도록 설정할 수 있다.

그러나 이와 같은 조치는 파일 업로드 요청에 명시된 MIME 타입을 변조함으로써 우회할 수 있다. 해당 기법에 대해 구체적으로 알아보자.

```html
<form action="write_proc.php" method="post" enctype="multipart/form-data">
  <input type="text" name="create_title" placeholder="title">
  <textarea name="create_body" placeholder="body"></textarea>
  <input type="file" name="upload_file">
  <button type="submit">Submit</button>
</form>
```

위의 HTML 코드는 파일 업로드 기능이 포함된 `<form>` 요소를 나타낸다. 이때 `enctype` 속성은 클라이언트가 폼 데이터를 어떤 방식으로 인코딩해 전송할지를 결정하는 속성이다. 파일 전송이 포함된 `<form>` 요소의 경우, 해당 속성의 값은 반드시 `multipart/form-data`로 설정되어야 한다.

`multipart/form-data`는 다양한 유형의 데이터를 여러 파트로 분리하여 동시에 전송할 수 있도록 설계된 인코딩 방식이다. 다음은 이러한 방식으로 데이터를 전송하는 실제 요청의 예시이다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2014/5.png" alt="multipart/form-data" style="padding: 0 15%; background-color: #2b2b2b;">

요청의 `Content-Type` 헤더에 `multipart/form-data`가 명시되며, 각 데이터 전송 파트를 구분하기 위한 고유의 바운더리 문자열이 함께 지정된다. 요청의 본문은 해당 바운더리를 기준으로 여러 파트로 구분되며, `Content-Disposition` 헤더를 포함하여 해당 데이터가 어떤 파라미터에 대응되는지를 나타낸다.

파일이 포함된 파트의 경우, 추가적으로 `Content-Type` 헤더를 사용하여 해당 파일의 MIME 타입을 지정한다. 만약 서버 측에서 해당 `Content-Type` 헤더 값을 검증하는 절차를 거친다면, 요청을 보낼 때 이 값을 서버가 허용하는 MIME 타입으로 변조하는 것만으로 업로드가 허용될 수 있다.

<br>

##### 파일 실행 차단

파일 업로드 공격의 핵심은 업로드된 파일이 웹 서버에서 실행 가능해야 한다는 점이다. 이에 따라, 업로드된 파일이 서버 측에서 실행되지 않도록 설정하는 것은 매우 효과적인 방어 기법 중 하나이다.

예를 들어, 파일 업로드 경로가 `/files/uploads`인 경우 해당 디렉터리 내에 저장된 파일이 실행되지 않도록 웹 서버의 설정을 조정할 수 있다. 이와 같이 설정할 경우, `.php`와 같은 확장자를 가진 스크립트 파일을 업로드하더라도 해당 파일은 단순한 텍스트로 취급되며 실행되지 않는다.

그러나 이러한 설정은 <strong>디렉터리 트래버설(Directory Traversal)</strong> 기법을 응용하여 우회할 수 있다. 디렉터리 트래버설은 공격자가 파일 경로나 명령어 내에 상위 디렉터리(`..`) 참조 문자 등을 삽입하여 의도하지 않은 파일이나 디렉터리에 접근·조작하는 공격 기법을 말한다. 예를 들어, 업로드 대상 파일의 이름을 `../webshell.php`와 같이 지정할 경우, 파일이 `/files/uploads`가 아닌 상위 디렉터리인 `/files`에 저장될 수 있다. 만약 `/files` 경로에서의 파일 실행이 허용되어 있다면, 공격자는 우회적으로 파일 실행 권한을 획득할 수 있게 된다.

웹 애플리케이션은 일반적으로 이러한 문자 조합을 필터링하지만, 공격자는 파일명을 URL 인코딩하여 `..%2Fwebshell.php`와 같이 우회할 수 있다. `%2F`는 `/`의 URL 인코딩 표현이며 서버가 이를 디코딩할 경우 동일한 디렉터리 이동 효과가 발생한다.

<br>

##### 파일 확장자 필터링

악성 스크립트가 포함된 파일을 제한하기 위해 특정 확장자(`.php` 등)를 필터링하는 방식도 고려할 수 있다. 그러나 PHP는 확장자에 대해 대소문자를 구분하지 않아 `pHp`, `PhP`, `PHP` 등 다양한 형태로 우회가 가능하다.

이러한 방법을 방지하기 위해 서버 측에서 대소문자를 구분하지 않고 모든 형태의 `.php` 확장자를 필터링하더라도, 여전히 다른 실행 가능한 확장자를 통해 우회가 가능하다. PHP는 `.php` 외에도 `.phtml`, `.php3`, `.php4`, `.php5` 등의 확장자를 기본적으로 지원한다. 공격자는 이러한 대체 확장자를 활용하여 필터링을 우회할 수 있으므로, 파일 확장자를 검사할 경우에는 허용된 확장자만 White List 방식으로 명시하는 편이 안전하다.

<br>

##### 파일 시그니처 필터링

파일 업로드 공격의 또 다른 대응 방안으로, 파일의 <strong>시그니처(Signature)</strong>를 검사하는 방식이 자주 사용된다. 파일 시그니처란 특정 파일 형식을 식별하기 위해 파일의 첫 부분에 포함된 고유한 바이트 값으로, 일반적으로 16진수(HEX) 값으로 표현된다. 예를 들어, PNG 파일은 `89 50 4E 47 0D 0A 1A 0A`, JPEG 파일은 `FF D8 FF` 등의 시그니처를 갖는다.

파일 업로드 시 서버는 이러한 시그니처를 검사하여 실제 파일 형식을 판단하고, 허용되지 않은 형식일 경우 업로드를 차단할 수 있다. 그러나 공격자는 이를 우회하기 위해 다음과 같은 방법을 사용할 수 있다.

**1. 업로드가 허용되는 정상 파일(PNG 이미지 등)을 HEX 편집기 환경에서 확인**  
**2. 시그니처를 그대로 유지한 채, PHP 코드를 HEX 표현으로 변환해 파일 내용에 추가**  
**3. 파일의 확장자를 `.php`로 변경한 후 업로드 시도**

이 경우, 파일 내용의 앞부분은 여전히 이미지 파일의 시그니처로 유지되므로 시그니처 기반 검사에서는 정상 파일로 인식된다. 하지만 확장자가 `.php`이기 때문에, 웹 서버는 이를 스크립트로 인식하고 실행할 수 있다.

> 파일을 서버에 업로드한 이후 실제로 서버 측에서 실행되게 하려면, 파일 확장자는 반드시 `.php` 등 서버가 실행 가능한 형식이어야 한다. 이미지 형식(`.png`, `.jpeg` 등)의 파일을 내부에 실행 코드를 포함시킨 채 업로드하더라도, 웹 서버가 이를 이미지로 처리하면 코드가 실행되지 않는다. 또한 `.php.png`, `.php.jpeg`와 같은 이중 확장자 역시 무효 처리되거나 실행이 차단될 수 있다.

---

#### 모의 해킹 시 유의사항

모의 해킹 수행 시에는 웹 셸을 무단으로 업로드하거나 사용해서는 안 된다. 실제 공격을 시뮬레이션한다고 하더라도, 사전 협의 없이 웹 셸을 업로드하는 행위는 허가된 범위 외 활동으로 간주될 수 있다.

기능 확인이 목적일 경우, `<?php echo "hello"; ?>`와 같은 간단한 출력 코드로 서버 측 실행 여부만을 검증하는 것이 바람직하다. 이는 XSS 검증 시 `alert(1);`과 같은 PoC 코드를 사용하는 방식과 유사하다.

정식 웹 셸을 통한 점검을 진행하고자 할 경우 반드시 사전 협의를 통해 허가를 받은 후 수행해야 하며, 테스트 완료 후 업로드한 파일은 즉시 삭제할 필요가 있다. 웹 셸이 서버에 잔존할 경우, 외부 위협에 의해 악용될 가능성이 있어 심각한 보안 위험으로 이어질 수 있다.

<br>
<br>
<br>

### 과제

#### File Vuln CTF

![File Vuln CTF](/data/Penetration%20Testing%20%7C%20Week%2014/6.png)

CTF를 해결하며 파일 업로드 공격을 실습해 보자.

<br>

##### Web Shell 1

<img src="/data/Penetration%20Testing%20%7C%20Week%2014/7.png" alt="Web Shell 1" style="padding: 0 25%; background-color: white;">

링크의 주소로 접속하면 다음과 같은 회원제 게시판 애플리케이션으로 이동한다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/8.png)

회원 가입을 진행하여 `any`/`any` 계정을 생성하고, 로그인 후 게시물 작성 페이지로 이동하였다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/9.png)

파일 업로드 기능이 포함되어 있는 것을 확인할 수 있다. 앞서 활용했던 `webshell.php` 파일을 업로드하고 게시물을 열람해 보았다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/10.png)

첨부 파일을 다운로드할 수 있는 링크를 발견하였다. 개발자 도구를 사용하여 해당 링크 요소를 자세히 살펴 보았다.

보안 업데이트에 의해 주석 처리된 `<a>` 요소의 `href` 속성에 `index.php?page=download&filePath=/var/www/html/uploads/90_webshell.php`라는 경로가 지정되어 있었다. 이를 통해 파일의 위치를 파악함과 동시에, 업로드한 파일의 이름이 서버 측 코드에 의해 임의로 변경되었음을 알 수 있었다.

파일 경로에서 `/var/www/html`은 웹 루트 디렉터리에 해당하므로, `http://ctf.segfaulthub.com:8989/uploads/90_webshell.php`라는 URL로 이동해 보았다. 이때 `webshell.php`에 작성한 스크립트를 고려하여 URL 뒤에 `cmd=ls` 쿼리스트링을 추가하였다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/11.png)

웹 셸이 실행되어 현재 디렉터리에 존재하는 파일들이 출력되었다. 다음으로 `flag.txt` 파일을 찾기 위해 `cmd` 파라미터의 값으로 다음 구문을 사용하였다.

<pre><code class="language-bash hljs" data-highlighted="yes"><span class="hljs-comment"># find: 파일/디렉터리 검색 명령어</span>
<span class="hljs-built_in">find</span> / -name <span class="hljs-string">"flag.txt"</span>
</code></pre>

위의 명령문은 웹 서버의 루트 디렉터리(`/`)에서 이름이 `flag.txt`인 파일을 검색하여 해당 파일의 경로를 출력한다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/12.png)

`flag.txt` 파일의 위치가 `/flag.txt`임을 확인하였다. 마지막으로 `cmd` 파라미터에 다음 구문을 입력하였다.

```bash
# cat: 파일 내용 출력·결합 명령어
cat /flag.txt
```

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/13.png)

`flag.txt` 파일의 내용이 출력됨에 따라 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">You_Got_SecretCode</span>}</span></p>

<br>

##### Web Shell 2

<img src="/data/Penetration%20Testing%20%7C%20Week%2014/14.png" alt="Web Shell 2" style="padding: 0 25%; background-color: white;">

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/15.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/16.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/17.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/18.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/19.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/20.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/21.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/22.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2014/23.png)

> <strong>디렉터리 인덱싱(Directory Indexing)</strong>
>
> **디렉터리 인덱싱**이란 웹 서버의 특정 디렉터리에 인덱스 파일(`index.html` 등)이 없을 때, 해당 디렉터리 내 모든 파일 목록을 클라이언트에게 자동으로 보여주는 설정 문제를 의미한다. 디렉터리 트래버설과 함께 묶여 흔히 **디렉터리 취약점**이라고 불린다.

segfault{Stupid_CODE}