--- meta
title: Penetration Testing | Week 3
date: 2025/04/22
excerpt: 로그인 처리 및 상태 관리 방식
categories: 모의 해킹
---

### 강의 노트

#### 식별과 인증

웹 사이트나 앱에 로그인할 때 우리는 보통 아이디와 비밀번호를 입력한다. 이 단순해 보이는 과정은 사실 두 가지 중요한 절차로 나뉘어 있는데, 바로 <strong>식별(Identification)</strong>과 <strong>인증(Authentication)</strong>이다.

**식별**은 사용자가 자신의 신원을 시스템에 제시하는 단계이다. 아이디나 이메일 주소를 입력하는 것이 이에 해당하며, 사용자를 식별할 수 있는 정보를 **식별정보**라고 한다. 특히 주민등록번호나 여권번호와 같이 개인을 고유하게 식별할 수 있는 정보의 경우에는 이를 **고유식별정보**라고 한다. 이름과 같이 쉽게 중복될 수 있는 정보와 달리 고유식별정보는 한 사람에게만 부여되는 유일한 값이기 때문에 일반적인 개인정보에 비해 훨씬 민감하게 다뤄지며 더 강한 보호 조치가 요구된다.  
데이터베이스에 식별 정보를 저장할 때에는, 하나의 레코드를 식별 정보만으로 구분할 수 있어야 하기 때문에 보통 <strong>기본 키(Primary Key)</strong>로 지정한다.

> <strong>기본 키(Primary Key)</strong>
>
> **기본 키**란 데이터베이스의 각 레코드마다 유일한 값을 가지는 필드를 말한다.  
> `NULL`의 값을 가질 수 없으며, 반드시 값이 존재해야 한다.

**인증**은 사용자가 제시한 정보가 실제로 그 사용자의 것인지를 증명하는 단계이다. 비밀번호를 입력하거나, 휴대폰으로 전송된 인증 번호를 입력하거나, 지문이나 얼굴 인식을 사용하는 것이 대표적인 인증 방식이다.

식별이 없으면 인증할 대상을 알 수 없고, 인증이 없으면 누구나 쉽게 알 수 있는 사용자 정보만을 제시한 채 시스템에 접근할 수 있게 된다. 따라서 이 두 단계는 항상 쌍으로 동작하며, 로그인 과정의 필수 요소로 작용한다.

로그인 로직은 크게 **식별·인증 동시 처리 방식**과 **식별·인증 분리 처리 방식**이 있다. 각 로직을 예시 코드와 함께 살펴보자.

<style>
  .hljs-subst {
    color: #e36209;
  }
</style>

```php
// 식별·인증 동시 처리

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'root');
define('DB_NAME', 'dev');

$db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$res = mysqli_query($db_conn, $sql);

if (mysqli_num_rows($res) == 1) {
  // Login Successful
} else {
  // Login Failed
}
```

식별·인증 동시 처리 방식에서는 하나의 SQL 쿼리 내에서 `username`과 `password`의 일치 여부를 동시에 확인한다.

```php
// 식별·인증 분리 처리 방식

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'root');
define('DB_NAME', 'dev');

$db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username = '$username'";
$res = mysqli_query($db_conn, $sql);

if (mysqli_num_rows($res) == 1) {
  $user = mysqli_fetch_array($res);
  if ($user['password'] == $password) {
    // Login Successful
  } else {
    // Login Failed
  }
} else {
  // Login Failed
}
```

식별·인증 분리 처리 방식에서는 `username`을 먼저 확인한 후, 그에 해당하는 `password`가 데이터베이스에 저장된 값과 일치하는지를 확인한다.

두 로직은 겉보기에 비슷해 보이지만, 대표적인 보안 공격 중 하나인 로그인 우회 기법에서 차이가 발생하며 이에 따른 대응 방식 역시 달라진다.

---

#### 해시 함수

<strong>해시 함수(Hash Function)</strong>란 데이터를 고정된 길이의 출력값으로 변환하는 수학적 알고리즘을 말한다.  
해시 함수의 가장 큰 특징은 바로 **일방향 함수**라는 것으로, 해시 값을 통해 원본 데이터를 복원하는 것이 불가능하다는 점에서 암호화나 인코딩과 같은 데이터 변환 방식과는 차이가 있다. 또한 입력 데이터가 조금만 달라져도 해시 값은 크게 바뀌기 때문에 데이터가 변경되었는지를 검증하기에 용이하다.

이러한 해시 함수의 특징은 단순히 내부 구조에서 비롯된 것이 아니며 보안성을 높이기 위한 목적 아래 의도적으로 설계된 결과이다. 예를 들어 데이터베이스에 사용자의 비밀번호를 실제 값이 아닌 해시 값으로 저장한다고 생각해 보자. 만약 외부 공격에 의해 데이터베이스를 탈취당하더라도 사용자의 인증 정보가 노출되는 사태를 막을 수 있다. 실제로 해시 함수를 이용한 비밀번호 저장 방식은 널리 사용되는 보안 기법 중 하나이다.

앞서 2가지 로그인 로직을 살펴보았는데, 각 방식에 해시 함수를 적용하면 총 4가지 로직을 구현할 수 있다.

---

#### 쿠키와 세션

사용자가 네이버에 로그인한 뒤, 네이버 메일이나 네이버 카페에 각각 접속한다고 가정해 보자. 이때 웹 서버는 단순히 파일을 제공하는 역할만 하는 것처럼 보이지만, 다른 서비스 페이지로 이동해도 사용자는 여전히 로그인된 상태를 유지하며 개인화된 정보를 제공받는다는 사실을 알 수 있다.  
이처럼 페이지를 이동해도 로그인 상태가 유지되는 이유는 웹에서 로그인 정보를 계속 기억할 수 있는 기능이 존재하기 때문이다. 이러한 기능을 구현하는 대표적인 방법으로는 <strong>쿠키(Cookie)</strong>와 <strong>세션(Session)</strong>이 있다.

**쿠키**란 클라이언트 브라우저에 저장되는 키와 값이 들어 있는 작은 데이터 파일을 말한다.  
사용자가 웹 사이트에 로그인하면 웹 서버에서는 `Set-Cookie` 응답 헤더를 설정하여 브라우저에 쿠키 값을 저장한다. 이후 클라이언트는 요청을 보낼 때마다 자동으로 쿠키를 함께 전송하며, 서버는 쿠키를 통해 사용자를 식별하여 로그인된 상태를 유지한다.

예를 들어, 사용자가 로그인 폼을 제출하면 브라우저는 서버에 다음과 같은 요청을 보낸다.

```text
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 27

username=john&password=1234
```

이후 서버의 응답 헤더는 다음과 같이 설정된다.

```text
HTTP/1.1 200 OK
Set-Cookie: user_id=john; Max-Age=3600; Path=/;
Content-Type: text/html
Content-Length: 17

Login successful!
```

위 예시에서 서버는 `user_id`라는 값을 쿠키에 설정하였다. 사용자가 다른 페이지로 이동하여 새로운 요청을 보낼 때에는 다음과 같은 형식으로 전송한다.

```text
GET /profile HTTP/1.1
Host: example.com
Cookie: user_id=john
```

`Cookie` 헤더에 `user_id` 값이 포함되어 전송되며, 서버는 이 값을 받아 확인한 후 이에 대응하는 사용자 정보를 찾아 로그인 상태를 유지한다.

위와 같은 방식은 보안상 매우 취약할 수 있다. 모든 요청에 사용자의 식별 정보가 그대로 포함되기 때문에, 만약 공격자가 HTTP 요청을 가로채 쿠키 값을 탈취한다면 실제 중요한 개인정보가 노출될 수 있다.  
이러한 보안 위협에 대응하고자 등장한 개념이 바로 **세션**이다.

**세션**이란 일반적으로 서버가 클라이언트와 일정 시간 동안 유지하는 상태나 연결 정보를 의미한다. 웹은 기본적으로 무상태(Stateless) 환경이기 때문에, 페이지를 새로고침하거나 이동하면 서버는 이전의 사용자를 기억하지 않는다. 이 문제를 해결하기 위해 서버는 사용자가 로그인하거나 특정 작업을 할 때, 이 사용자와 연결된 정보를 임시로 저장한다. 이때 브라우저는 서버로부터 세션을 특정하기 위한 세션 ID를 전달받고 이후 요청을 보낼 때마다 이 값을 함께 전송한다. 서버는 전송받은 세션 ID를 기반으로 서버 측 세션 저장소에 저장된 사용자 정보를 찾아 로그인 상태를 유지한다.

쿠키에서의 예시와 동일하게 브라우저가 로그인 요청을 보내면, 서버는 다음과 같은 응답을 보낸다.

```text
HTTP/1.1 200 OK
Set-Cookie: PHPSESSID=abc123xyz456; Path=/;
Content-Type: text/html
Content-Length: 17

Login successful!
```

`Set-Cookie` 헤더로 랜덤한 문자열로 설정된 `PHPSESSID` 값이 브라우저에 저장되며 이후 브라우저는 `Cookie` 헤더에 이 세션 ID를 포함해 전송한다.

정리하자면, 세션은 쿠키에 민감한 정보를 담지 않고 안전하게 서버 측에서 상태를 관리하기 위해 사용하는 방식이다.

<br>
<br>
<br>

### 과제

#### 4가지 로그인 로직 구현

다음과 같은 간단한 `users` 테이블을 기준으로 4가지 로그인 로직을 구현해 보자.  
이 예시에서는 `username`을 기본 키로 지정하였다.

![users 테이블 생성](/data/Penetration%20Testing%20%7C%20Week%203/1.png)

`users` 테이블에는 다음과 같이 시험용 계정 `test`/`test`가 저장되어 있다.

<img src="/data/Penetration%20Testing%20%7C%20Week%203/2.png" alt="users 테이블" style="padding: 0 25%; background-color: white">

2주차에 제작했던 로그인 처리 코드(`login_proc.php`)를 조금씩 수정하여 구현하도록 한다.

<br>

##### 1\. 식별·인증 동시 처리 방식

```php
// login_proc_1.php

<?php
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');
  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  $message = "";

  $username = $_POST['username'];
  $password = $_POST['password'];

  // Check the username and password in a single SQL query
  $sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
  $res = mysqli_query($db_conn, $sql);

  if (mysqli_num_rows($res) == 1) {
    $message = "<p style='color: green;'>Login Successful!</p>";
  } else {
    $message = "<p style='color: red;'>Login Failed. Incorrect Username or Password.</p>";
  }
?>

...
```

<br>

##### 2\. 식별·인증 분리 처리 방식

```php
// login_proc_2.php

<?php
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');
  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  $message = "";

  $username = $_POST['username'];
  $password = $_POST['password'];

  // Verify the username first
  $sql = "SELECT * FROM users WHERE username = '$username'";
  $res = mysqli_query($db_conn, $sql);

  // Check if the password matches
  if (mysqli_num_rows($res) == 1) {
    $user = mysqli_fetch_array($res);

    if ($user['password'] === $password) {
      $message = "<p style='color: green;'>Login Successful!</p>";
    } else {
      $message = "<p style='color: red;'>Login Failed. Incorrect password.</p>";
    }
  } else {
    $message = "<p style='color: red;'>Login Failed. Username not found.</p>";
  }
?>

...
```

<br>

##### 3\. 식별·인증 동시 처리 방식(with Hash)

해시 함수를 활용한 로그인 로직을 구현하려면, 데이터베이스에는 사용자의 실제 비밀번호가 아닌 해당 비밀번호의 해시 값이 저장되어 있어야 한다. 따라서 기존에 저장된 원본 비밀번호 `test`를 해시 값으로 변환한다. 이 작업은 회원 가입 페이지(<code>sign_<wbr>up<wbr>.php</code>)에서 사용자 정보를 저장할 때 비밀번호를 해시 처리한 후 삽입하도록 구현할 수 있다.  
이후 `users` 테이블은 다음과 같은 형태가 된다.

<img src="/data/Penetration%20Testing%20%7C%20Week%203/3.png" alt="users 테이블" style="padding: 0 8%; background-color: white">

해시 함수로는 대표적인 해시 알고리즘 중 하나인 SHA-256을 사용하였다.

```php
// login_proc_3.php

<?php
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');
  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  $message = "";

  $username = $_POST['username'];
  
  // Apply SHA-256 hashing to the password input for basic security
  $password = hash('sha256', $_POST['password']);

  // Check the username and password in a single SQL query
  $sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
  $res = mysqli_query($db_conn, $sql);

  if (mysqli_num_rows($res) == 1) {
    $message = "<p style='color: green;'>Login Successful!</p>";
  } else {
    $message = "<p style='color: red;'>Login Failed. Incorrect Username or Password.</p>";
  }
?>

...
```

<br>

##### 4\. 식별·인증 분리 처리 방식(with Hash)

```php
// login_proc_4.php

<?php
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');
  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  $message = "";

  $username = $_POST['username'];

  // Apply SHA-256 hashing to the password input for basic security
  $password = hash('sha256', $_POST['password']);

  // Verify the username first
  $sql = "SELECT * FROM users WHERE username = '$username'";
  $res = mysqli_query($db_conn, $sql);

  // Check if the password matches
  if (mysqli_num_rows($res) == 1) {
    $user = mysqli_fetch_array($res);

    if ($user['password'] === $password) {
      $message = "<p style='color: green;'>Login Successful!</p>";
    } else {
      $message = "<p style='color: red;'>Login Failed. Incorrect password.</p>";
    }
  } else {
    $message = "<p style='color: red;'>Login Failed. Username not found.</p>";
  }
?>

...
```