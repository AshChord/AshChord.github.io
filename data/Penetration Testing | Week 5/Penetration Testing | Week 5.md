--- meta
title: Penetration Testing | Week 5
date: 2025/05/06
excerpt: SQL Injection의 개념과 인증 우회
categories: 모의 해킹
---

### 강의 노트

#### SQL Injection

**SQL Injection**은 웹 애플리케이션에서 사용자의 입력 값이 적절한 검증 없이 SQL 쿼리에 직접 포함될 때 발생하는 보안 취약점을 말한다. 공격자는 이 취약점을 이용해 악의적으로 조작된 SQL 구문을 삽입함으로써, 애플리케이션이 원래 의도한 동작과는 다른 방식으로 데이터베이스 명령을 수행하도록 유도할 수 있다.

이러한 공격은 주로 로그인, 검색, 필터링 등의 기능에서 발생하며, 성공할 경우 인증 우회, 민감 정보 조회 및 변경, 데이터베이스 구조 노출 등의 피해로 이어질 수 있다. 따라서 SQL 인젝션은 애플리케이션 보안에서 매우 치명적인 위협 요소 중 하나로 간주된다.

SQL Injection의 동작 원리는 다음과 같다. 로그인 기능을 구현할 때 자주 사용되는 PHP 코드를 생각해 보자.

<style>
  .hljs-subst {
    color: #e36209;
  }
</style>

```php
$sql = "SELECT * FROM user WHERE username = '$username' AND password = '$password'";
```

사용자가 `username`에 `user`, `password`에 `1234`를 입력했다고 가정하면, `$sql` 변수에는 다음과 같은 쿼리가 저장된다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">'user'</span> <span class="hljs-keyword">AND</span> password <span class="hljs-operator">=</span> <span class="hljs-string">'1234'</span>
</code></pre>

정상적인 경우 이 쿼리는 데이터베이스에서 해당 ID와 비밀번호를 가진 사용자 정보를 조회하는 역할을 한다.  
그런데 만약 `username`에 `user'`를 입력하면 어떻게 될까?

![SQL Injection Practice](/data/Penetration%20Testing%20|%20Week%205/1.png)

위의 웹 사이트는 앞서 살펴 보았던 PHP 코드를 사용하여 구현된 간이 로그인 사이트이다.  
`user'`와 `1234`를 입력하여 로그인을 시도해 보자.

![SQL Injection Practice](/data/Penetration%20Testing%20|%20Week%205/2.png)

단순히 로그인에 실패하는 것이 아니라, SQL 문법 오류(SQL syntax error)가 발생한다. 다시 말해 서버가 생성한 쿼리가 SQL 문법에 맞지 않는다는 의미이다.  
그 이유는 간단한데, 사용자의 입력 값이 쿼리에 그대로 삽입되면서 최종적으로 다음과 같은 형태가 되기 때문이다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">'user'' AND password = '</span><span class="hljs-number">1234</span><span class="hljs-string">'
</span></code></pre>

SQL에서는 문자열에 작은따옴표(`'`)를 포함해야 할 경우, 작은따옴표를 두 번 연속으로 써서 이스케이프 처리한다.  
따라서 위 쿼리에서 `'user''` 부분은 문자열 내에 작은따옴표가 포함된 것으로 처리되며, 이로 인해 비정상적으로 `'user'' AND password = '`에서 문자열이 종료된다. 결과적으로 그 뒤에 이어지는 `1234'`는 올바르지 않은 위치에 존재하게 되어 SQL 문법 오류가 발생한 것이다.

이를 통해 알 수 있는 사실은, 사용자가 입력한 작은따옴표가 그대로 SQL 쿼리에 삽입되어 문법 기호로서 기능한다는 것이다. 이 특성을 활용하면 임의의 SQL 쿼리를 작성하여 데이터베이스에 비정상적으로 접근하는 것도 가능하다.

예를 들어 `username`에 `user'#`를 입력한다고 생각해 보자. 이때 SQL 쿼리는 다음과 같다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">'user'</span><span class="hljs-comment">#' AND password = '1234'</span>
</code></pre>

`#`은 SQL에서 주석을 의미하므로 이후에 나오는 모든 내용은 무시된다. 비밀번호 조건은 쿼리 실행에 전혀 영향을 주지 않게 되며, `username`이 `user`인 행을 별도 조건 없이 조회하게 된다.

즉, 다음과 같이 비밀번호를 알지 못한 상태로도 로그인이 가능해지는 인증 우회 공격이 발생하는 것이다.

![SQL Injection Practice](/data/Penetration%20Testing%20|%20Week%205/3.png)

`#`을 이용한 방식 외에도 다양한 형태의 SQL Injection 페이로드가 존재하며, SQL 쿼리의 구조에 따라 다르게 동작할 수 있다.  
자세한 내용은 과제를 해결하면서 학습해 보자.

<br>
<br>
<br>

### 과제

#### Authentication Bypass CTF

![Authentication Bypass](/data/Penetration%20Testing%20|%20Week%205/4.png)

다양한 형태의 인증 절차를 우회하여 로그인을 수행하는 CTF이다.  
SQL Injection뿐만 아니라 지금까지 배운 내용을 종합적으로 활용하여 해결해야 하는 문제들이 포함되어 있다.

<br>

##### Get Admin

<img src="/data/Penetration%20Testing%20%7C%20Week%205/5.png" alt="Get Admin" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![Get Admin](/data/Penetration%20Testing%20|%20Week%205/6.png)

우선 주어진 계정으로 로그인을 시도하였다.

![Get Admin](/data/Penetration%20Testing%20|%20Week%205/7.png)

로그인 절차를 분석하기 위해 Burp Suite에서 패킷을 확인하였다.

![Get Admin](/data/Penetration%20Testing%20|%20Week%205/8.png)
![Get Admin](/data/Penetration%20Testing%20|%20Week%205/9.png)

로그인 양식에 데이터를 입력하면 POST 방식으로 서버에 전달되는 것을 확인할 수 있다. 특히 주목할 점은 응답에서 `Set-Cookie` 헤더가 설정되고 `loginUser`에 `doldol`이라는 값이 할당된다는 것이다. 이후 해당 쿠키 값을 사용하여 `index.php`에 접근하면 로그인에 성공하게 된다.

그렇다면 `doldol` 계정으로 로그인한 후, `index.php`로의 요청을 가로채 `loginUser` 값을 `admin`으로 변경하면 `admin` 계정으로 로그인에 성공할 가능성이 높다.

![Get Admin](/data/Penetration%20Testing%20|%20Week%205/10.png)
![Get Admin](/data/Penetration%20Testing%20|%20Week%205/11.png)

Burp Suite의 Intercept 기능을 활용해 변조한 요청을 전송한 결과, 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">Cookie_Honey</span>}</span></p>

<br>

##### PIN CODE Bypass

<img src="/data/Penetration%20Testing%20%7C%20Week%205/12.png" alt="PIN CODE Bypass" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![PIN CODE Bypass](/data/Penetration%20Testing%20|%20Week%205/13.png)

우선 Fire 버튼을 클릭해 보았다.

![PIN CODE Bypass](/data/Penetration%20Testing%20|%20Week%205/14.png)

`step1.php`로 이동하며 관리자 확인 화면이 출력되었다. 이후 확인 버튼을 클릭하였다.

![PIN CODE Bypass](/data/Penetration%20Testing%20|%20Week%205/15.png)

`step2.php`로 이동하며 인증 화면이 출력되었다. 무작위로 비밀번호를 입력한 후 인증 절차를 분석할 수도 있겠으나, `step1.php`와 `step2.php`라는 주소가 수상하게 여겨져 우선 주소 창을 통해 `step3.php`로의 이동을 시도해 보았다.

![PIN CODE Bypass](/data/Penetration%20Testing%20|%20Week%205/16.png)

예상대로 발사 화면이 출력되었다. 정상적으로 인증을 진행하면 `step3.php`로의 리다이렉션이 이루어질 것으로 추측된다.

![PIN CODE Bypass](/data/Penetration%20Testing%20|%20Week%205/17.png)

Fire 버튼을 클릭하면 플래그가 출력된다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">JumpBypass</span>}</span></p>

<br>

##### Admin is Mine

<img src="/data/Penetration%20Testing%20%7C%20Week%205/18.png" alt="Admin is Mine" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 Get Admin에서와 같은 로그인 페이지로 이동한다.  
주어진 계정으로 로그인을 시도하기 전에 한 가지 특이점을 발견했는데, 바로 `login.php`에 접속하면 실행되는 JavaScript 코드들이 존재한다는 사실이었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%205/19.png" alt="Admin is Mine" style="padding: 0 25%; background-color: #2b2b2b">

`bootstrap.min.js`는 웹 디자인 관련 코드로 중요하지 않은 내용이었고, `login.js`는 로그인 절차와의 연관성이 분명해 보였으므로 패킷을 자세히 확인해 보았다.

![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/20.png)
![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/21.png)

`login.js`는 사용자로부터 아이디와 비밀번호를 입력받아 GET 방식으로 서버에 전송한 후, 서버로부터 응답을 받으면 이를 JSON 형식으로 파싱하여 `result`라는 키에 해당하는 값을 확인한다. `result` 값이 `ok`인 경우 로그인 성공으로 처리하며, 그렇지 않으면 로그인 실패로 처리한다.

대강의 로그인 절차를 파악하였으므로 바로 로그인을 시도하였다.

![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/22.png)

예상대로 `result`에 `ok` 값이 저장된 채로 서버에서 응답이 도착하였다.  
다음으로 `admin` 계정으로 무작위 비밀번호와 함께 로그인을 시도하였다. 

![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/23.png)

`result`에 `fail` 값이 저장되었다. 서버에서 오는 응답을 변조하여 `ok`로 변경하면 로그인을 우회할 수 있었겠지만, Burp Suite의 Intercept 기능은 요청만을 가로채고 응답은 가로채지 않아 변조할 수 없었다.

혹시나 서버 응답을 변조하는 기능이 Burp Suite에 존재하는지 궁금하여 검색을 시도하였고, 얼마 지나지 않아 PortSwigger (Burp Suite 개발사) 웹 사이트의 Documentation 페이지에서 서버 응답을 가로채는 방법을 확인할 수 있었다.

![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/24.png)

가로챈 요청을 우클릭하여 컨텍스트 메뉴를 열면 해당 요청에 대한 응답을 가로챌 수 있다.  
바로 해당 방법을 적용해 실행해 보았다.

![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/25.png)
![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/26.png)

정상적으로 응답을 가로챌 수 있었고, 이를 변조하여 `fail`을 `ok`로 수정하면 로그인에 성공할 것으로 추측하였다.

![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/27.png)
![Admin is Mine](/data/Penetration%20Testing%20|%20Week%205/28.png)

변조한 응답을 브라우저로 전송하자 `login.js`에 의해 `index.php`로 리다이렉트되며 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">resposneMod</span>}</span></p>

<br>

##### PIN CODE Crack

<img src="/data/Penetration%20Testing%20%7C%20Week%205/29.png" alt="PIN CODE Crack" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/30.png)

LOGIN 버튼을 누르면 다음과 같이 4자리 PIN Code를 입력하라는 화면이 출력된다.

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/31.png)

임의로 `0000`을 입력한 후 Burp Suite에서 패킷을 확인해 보았다.

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/32.png)

GET 방식으로 코드가 전송된다는 사실 외에는 특기할 만한 점을 찾지 못했다. 그러나 Admin is Mine 문제를 해결하는 과정에서 PortSwigger의 Documentation 페이지를 대강 살펴 봤기 때문에 로그인을 우회할 수 있는 전략을 빠르게 구상할 수 있었다.

바로 BurpSuite의 Intruder 기능을 활용하는 것으로, Intruder의 사용법에 대해서는 아래 링크에 상세히 설명되어 있다.  
[https://portswigger.net/burp/documentation/desktop/tools/intruder](https://portswigger.net/burp/documentation/desktop/tools/intruder)

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/33.png)

로그인 요청을 Intruder로 전달한 후, 입력한 코드인 `0000` 부분을 페이로드 포지션으로 지정하였다. 이후 페이로드 유형을 `Numbers`로 설정하고, `0000`부터 `9999`까지의 범위를 지정하였다. 또한 코드가 항상 4자리임을 고려하여 `Min/Max integer digits`를 `4`로 설정하였다. 설정을 완료한 후, Start Attack을 클릭하면 Intruder가 자동으로 페이로드 값을 증가시키며 요청을 전송한다. 결과는 다음과 같은 형태로 확인되었다.

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/34.png)

`1020`까지의 코드는 로그인 실패 알림과 함께 `login.php`로 리다이렉트시키는 응답이 전송되며, 응답 길이는 420이었다. 그러나 코드 값으로 `1021`을 전송했을 경우 응답 길이가 357로 현저하게 달라지는 것을 확인할 수 있었다.

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/35.png)

이에 따라 응답 내용이 달라졌음을 알 수 있었고, `1021`을 입력하면 로그인에 실패하지 않고 `index.php`로 리다이렉트됨을 확인하였다.

![PIN CODE Crack](/data/Penetration%20Testing%20|%20Week%205/36.png)

올바른 PIN Code인 `1021`을 입력하여 플래그를 획득하였다.

> **Brute Force**
>
> 가능한 모든 경우의 수를 시도하여 정답을 찾아내는 공격 방법을 **Brute Force**라고 한다. 시간과 자원의 소모가 상당하여 표면적으로 비효율적인 방법으로 인식될 수 있으나 100%의 정확도를 보장하기 때문에 공격 방식 중 가장 확실하고 치명적이다.

참고로, Burp Suite Community Edition은 Intruder의 속도가 매우 느리다. 총 10000번의 요청을 전송해야 하는 상황에서 시간이 지나치게 소요되어 1000개씩 나누어 전송하며 확인하였다. 다행히 1000번대 번호에서 정답을 발견하여 아주 오랜 시간이 걸리지는 않았으나, 동일한 작업을 수행할 수 있는 스크립트를 작성하여 공격을 수행하는 것이 훨씬 더 적합하다고 판단된다. 예시 스크립트를 아래에 첨부한다.

```python
# brute_force.py

import requests

url = "http://ctf.segfaulthub.com:1129/checkOTP.php"

for i in range(10000):
  code = f"{i:04}"
  response = requests.get(url, params={"optNUM": code})
  
  if "Login Fail" not in response.text:
    print(f"PIN CODE: {code}")
    break
```

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">BruteForceGOGOGO</span>}</span></p>

<br>

##### Login Bypass 1

<img src="/data/Penetration%20Testing%20%7C%20Week%205/37.png" alt="Login Bypass 1" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 예상대로 로그인 페이지로 이동한다.  

우선 주어진 계정으로 로그인을 시도해 보았다.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/38.png)

POST 방식으로 입력한 데이터가 전달되며 `index.php`로 리다이렉트된다. 로그인 실패는 어떤 방식으로 이루어지는지 확인하기 위해 임의의 비밀번호로 로그인을 시도하였다.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/39.png)

로그인에 실패하는 경우는 상태 코드 `200 OK`가 도착하며 `index.php`로 이동하지 않는다. 이외에는 특이 사항이 보이지 않아 이번 주 학습한 SQL Injection을 시도해보기로 결정하였다.

SQL Injection 공격이 가능한지 확인하는 가장 쉬운 방법은 입력 데이터 뒤에 `'and '1' = '1`을 추가하는 것이다. 이를테면 다음과 같다.

```php
$sql = "SELECT * FROM user WHERE username = '$username' AND password = '$password'";
```

로그인 기능을 담당하는 SQL 쿼리이다. `username`에 `user`와 `user' and '1' = '1`을 각각 할당해 보자.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-comment">/* username: user */</span>
<span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">'user'</span> <span class="hljs-keyword">AND</span> password <span class="hljs-operator">=</span> <span class="hljs-string">'1234'</span>

<span class="hljs-comment">/* username: user' and '1' = '1 */</span>
<span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">'user'</span> <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1'</span> <span class="hljs-keyword">AND</span> password <span class="hljs-operator">=</span> <span class="hljs-string">'1234'</span>

<span class="hljs-comment">/* SQL 키워드는 가독성을 위해 대문자로 작성하는 것이 관례이나, 문법적으로 대소문자를 구분하지 않음 */</span>
</code></pre>

두 번째 SQL 쿼리는 `username = 'user'` 조건 뒤에 `and '1' = '1'` 조건이 추가된 형태이다. 여기서 `'1' = '1'`은 항상 참인 조건이며, `AND` 연산에서 항등원은 참이므로, 해당 조건의 추가는 전체 쿼리의 의미에 영향을 미치지 않는다. 따라서 두 쿼리는 그 논리적 효과에 있어 실질적으로 동일하다. 따라서 `' and '1' = '1'`을 추가한 데이터를 전송해도 동일한 결과가 도출된다면 이는 입력한 텍스트가 그대로 SQL 쿼리로 처리되고 있다는 것을 의미하며, SQL Injection 공격이 효과가 있을 가능성이 높다는 것을 시사한다.

`doldol' and '1' = '1`과 `dol1234`를 입력하여 로그인을 시도해 보자.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/40.png)

예상대로 로그인에 성공하였다. 다만 실제로 전송되는 데이터는 <strong>URL 인코딩(URL Encoding)</strong> 방식으로 변환된 형태였다. 검색 결과, 웹 페이지에서 입력 양식을 통해 데이터를 전송할 때 URL 인코딩을 사용하는 것이 표준 방식임을 확인할 수 있었다. 요청의 `Content-Type: application/x-www-form-urlencoded` 헤더는 전송되는 데이터의 형식을 나타내며, URL 인코딩 방식으로 데이터가 처리되고 있음을 명시하고 있다. 이후 서버 측에서는 수신된 데이터를 디코딩하여 원본 데이터를 복원한다. 예를 들어, PHP의 경우 `$_GET`, `$_POST` 등의 슈퍼글로벌 변수에 대해 내부적으로 URL 디코딩이 수행된다.

참고로 POST 방식으로 데이터를 전달할 경우 URL에 데이터를 포함하지 않으므로 URL 인코딩을 따로 수행하지 않아도 큰 문제는 발생하지 않는다. 실제로 다음과 같이 패킷을 수정하여 원본 데이터를 그대로 전송하더라도 로그인에 성공하는 것을 확인할 수 있다.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/41.png)

`AND` 연산을 이용한 SQL Injection이 통한다면 `OR` 연산 역시 동일하게 활용할 수 있다.  
`OR` 연산을 사용한 공격은 특히 유용한데, 그 이유는 다음과 같다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-comment">/* username: user' or '1' = '1 */</span>
<span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">'user'</span> <span class="hljs-keyword">or</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1'</span> <span class="hljs-keyword">AND</span> password <span class="hljs-operator">=</span> <span class="hljs-string">'1234'</span>
</code></pre>

`OR` 연산은 `AND` 연산보다 우선순위가 낮다. 따라서 `'1' = '1' AND password = '1234'` 조건이 먼저 평가된 후 `OR` 연산이 수행된다. 결과적으로 뒤의 조건이 참이든 거짓이든 `username = 'user'` 조건이 참이라면 데이터가 조회된다.  
즉, 다음과 같이 올바른 비밀번호 없이도 로그인을 성공할 수 있다.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/42.png)

정확한 로그인 절차와 사용되는 SQL 쿼리는 확인할 수 없으나, 상기한 방식과 유사한 처리가 이루어지고 있음을 추측할 수 있다.
이제 ID만 `normaltic1`으로 바꾸면 `normaltic1` 계정으로 로그인할 수 있다.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/43.png)

리다이렉션을 통해 `index.php`로 이동하면 플래그가 출력된다.

![Login Bypass 1](/data/Penetration%20Testing%20|%20Week%205/44.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">byPassWithSQLi</span>}</span></p>


<br>

##### Login Bypass 2

<img src="/data/Penetration%20Testing%20%7C%20Week%205/45.png" alt="Login Bypass 2" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하여 로그인을 시도해 보았다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/46.png)
![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/47.png)

Login Bypass 1과 동일하게, 로그인에 성공하면 `index.php`로 리다이렉트되고 실패하면 `200 OK`가 출력된다.  
마찬가지로 SQL Injection을 시도해 보았다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/48.png)

`' and '1' = '1`을 추가하여 전송한 결과 로그인에 성공했다. Login Bypass 2에서도 입력한 데이터가 그대로 SQL 쿼리로 실행되고 있었음을 의미한다. 다음으로 `UserId`에 `' or '1' = '1`을 추가하고 `Password`에 임의의 값을 넣어 로그인을 시도해 보았다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/49.png)

로그인에 실패한 것을 확인하였다. 이에 대해 추측해 본 결과, 서버가 로그인 요청을 식별·인증 분리 방식으로 처리할 가능성이 있다고 판단하였다. 이를테면 다음과 같은 방식으로 동작하고 있을 수 있다.

```php
$username = $_POST['UserId'];
$password = $_POST['Password']

$sql = "SELECT * FROM user WHERE username = '$username'";
$res = mysqli_query($db_conn, $sql);
$user = mysqli_fetch_array($res);

if ($user && $user['password'] == $password) {
  // Login Successful
} else {
  // Login Failed
}
```

이 경우 SQL 쿼리는 단지 `UserId`와 일치하는 사용자를 확인할 뿐이며, 실제로 로그인을 성공하기 위해서는 비밀번호의 일치 여부를 별도로 확인하는 절차가 요구된다. 따라서 SQL Injection이 성공하더라도 그 자체로는 로그인에 성공할 수 없는 구조인 것이다. 이 추측이 사실인지 검증하기 위해, 올바른 비밀번호인 `dol1234`를 입력하여 로그인을 다시 시도해 보았다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/50.png)

올바른 비밀번호를 입력하였음에도 불구하고 로그인이 정상적으로 이루어지지 않았다. 이에 대해 잠시 고민해 본 결과, 그 원인을 빠르게 파악할 수 있었다. 앞서 추측한 대로 로그인 절차가 식별과 인증을 분리하여 처리하는 구조라면, ID 입력란에 `' or '1' = '1`을 추가하는 행위는 `WHERE` 절을 항상 참으로 만들어 버리는 결과를 초래한다. 이 경우 사용자 테이블 내의 특정 사용자(`doldol`)만 조회되는 것이 아니라 전체 레코드가 반환되며, 그 결과 `$user` 변수에 의도하지 않은 다른 사용자의 정보가 저장될 우려가 발생한다.

이러한 상황을 방지하고자 이번에는 `OR` 연산의 항등원이 거짓이라는 점을 이용하여 `UserId`에 `' or '1' = '2`를 추가한 뒤, 올바른 비밀번호를 입력하여 다시 로그인을 시도하였다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/51.png)

이 방법 역시 로그인에 실패하였다. 따라서 이는 위의 추측과는 다른 방식으로 로그인이 처리되고 있음을 시사한다. `' and '1' = '1`을 추가하는 경우와 `' or '1' = '2`를 추가하는 경우는 논리적 의미상 실질적인 차이가 존재하지 않기 때문에, 이론적으로는 다른 결과가 도출될 수 없다.

이러한 점을 고려하여 도출된 두 번째 가설은, 서버 측 코드에서 SQL 쿼리에 `OR` 연산이 포함되지 못하도록 제한하는 구문이 존재한다는 것이다. 이를테면 다음과 같은 방식이다.

```php
$username = $_POST['UserId'];
$password = $_POST['Password']

// stripos(): 문자열에서 특정 문자열(대소문자 불구분)이 처음 나타나는 위치를 반환하는 함수
if (stripos($username, 'or') !== false || stripos($password, 'or') !== false) {
  // Login Failed
}

$sql = "SELECT * FROM user WHERE username = '$username' AND password = '$password'";
$res = mysqli_query($db_conn, $sql);

if (mysqli_num_rows($res) == 1) {
  // Login Successful
} else {
  // Login Failed
}
```

위와 같은 경우 입력 값에 `OR` 연산자를 포함시키는 즉시 로그인은 실패로 처리된다. 이러한 전제 하에, `OR` 연산을 활용한 공격이 아닌 주석 처리를 이용한 공격을 시도해 보았다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/52.png)

주석 처리를 이용한 방법은 로그인에 성공하였다. 이 말은 곧 식별과 인증이 하나의 SQL 쿼리 내에서 동시에 이루어진다는 뜻이며, 예상한 대로 서버 측에서 `OR` 연산자가 필터링되는 형태일 가능성이 높다는 점을 시사한다.

이제 `UserId`를 `normaltic2'#`으로 수정하면 `normaltic2` 계정으로 로그인할 수 있다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/53.png)

리다이렉션을 통해 `index.php`로 이동하면 플래그가 출력된다.

![Login Bypass 2](/data/Penetration%20Testing%20|%20Week%205/54.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">FilterWhat?!</span>}</span></p>