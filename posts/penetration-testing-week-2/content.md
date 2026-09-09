# Penetration Testing | Week 2

## 강의 노트

### 로그인 페이지 구조

1주 차 과제로 PHP를 활용해 간단한 로그인 페이지를 제작했다.  
이번에는 실제 서비스 구조에 조금 더 가까운 흐름을 설계해 보자.

- 메인 페이지는 `index.php`이다.
- 사용자가 로그인하지 않은 상태로 접근하면 자동으로 `login.php`로 리다이렉트된다.
- 로그인한 사용자라면 사용자 정보를 포함해 `index.php`가 정상적으로 출력된다.

이러한 흐름을 구현하기 위해서, 다음과 같은 `index.php` 코드를 생각해 볼 수 있다.

<style id="code-1">
  #code-1 + pre data[value="10"] span {color: #24292E !important;}
</style>
```php
// index.php

<?php
  if ($_GET['login_id'] == "") {
    header("Location: login.php");
    exit;
  }
?>

...
```

위 코드에서는 `login_id` 파라미터의 존재 여부를 확인한다. 해당 값이 비어 있다면 로그인되지 않은 상태로 판단하고, `login.php`로 리다이렉트한다.
- `header()` 함수는 HTTP 응답 헤더에 `Location: login.php`를 추가하여 사용자가 `login.php` 페이지로 이동하도록 하는 역할을 수행한다.
- `exit`은 스크립트 실행을 종료하는 명령어로, 리다이렉션 후 `header()` 뒤의 코드가 불필요하게 노출되거나 실행되는 것을 방지하기 위해 사용된다.

`login.php`는 다음과 같이 작성할 수 있다.

<style id="code-2">
  #code-2 + pre data[value="20"] span {color: #24292E !important;}
</style>
```php
// login.php

<?php
// require_once(): 외부 파일을 한 번만 포함시키는 함수
require_once('login_func.php');

// isset(): 해당 값이 존재하며 null이 아닌지 확인하는 함수
if (isset($_POST['Submit'])) {
  $login_res = login($_POST['UserId'], $_POST['Password']);
  if ($login_res) {
    // .: 문자열 결합 연산자
    header("location:index.php?login_id=" . $login_res);
    exit;
  } else {
    echo "로그인 실패";
  }
}
?>

...
```

사용자가 로그인 양식을 제출하면, `UserId`와 `Password` 값을 받아 `login()` 함수가 호출된다. 그 결과가 참이면 로그인에 성공한 것으로 간주하고, 사용자의 로그인 정보를 쿼리 스트링 형식(GET 방식)으로 `login_id`에 담아 `index.php`로 리다이렉트한다. `login()` 함수의 반환 결과가 거짓인 경우에는 로그인 실패 메시지를 출력한다.

---

### 데이터베이스

**데이터베이스**란 웹 애플리케이션에서 필요한 데이터를 저장 및 관리하는 시스템을 말한다. 흔히 사용하는 엑셀 프로그램과 구조적으로 유사한 점이 있는데, 데이터베이스의 주요 개념은 엑셀의 구성 요소와 다음과 같이 비교할 수 있다.

| 데이터베이스 주요 개념 | 엑셀 구성 요소 | 설명 |
| --- | --- | --- |
| 데이터베이스(Broadly) | 엑셀 프로그램 전체 | 데이터를 저장·관리하는 전체 시스템 혹은 기술 영역 |
| 데이터베이스(Narrowly) | 엑셀 파일 | 데이터가 저장되는 구조적 공간 |
| 테이블 | 엑셀 시트 | 행과 열로 이루어진 데이터 집합 |
| 레코드 | 엑셀 시트의 한 행(Row) | 하나의 데이터 항목(한 사람, 한 거래 등) |
| 필드 | 엑셀 시트의 한 열(Column) | 데이터의 속성(이름, 나이, 이메일 등) |
{:.database-table}

<style>
.database-table th {
  &:nth-child(1) { width: 25%; }
  &:nth-child(2) { width: 30%; }
  &:nth-child(3) { width: 45%; }
}
</style>

---

### SQL

<strong>SQL(Structured Query Language)</strong>은 데이터베이스를 관리하고 조작하기 위해 사용하는 언어이다.  
SQL의 간단한 명령어들을 실행 예시와 함께 알아보자.

사용 예시는 다음과 같은 `stock_list` 테이블을 기준으로 한다.

| company_id | stock_symbol | company_name     | market |
|------------|--------------|------------------|--------|
| 1          | AAPL         | Apple            | NASDAQ |
| 2          | TSLA         | Tesla            | NASDAQ |
| 3          | MSFT         | Microsoft        | NASDAQ |
| 4          | JPM          | JPMorgan Chase   | NYSE   |
| 5          | NVDA         | NVIDIA           | NASDAQ |

<br>

#### SELECT: 데이터 조회

```sql
/* Syntax */
SELECT [column_1], [column_2], ... FROM [table_name];


/* Example */
SELECT * FROM stock_list;
SELECT market FROM stock_list;
SELECT stock_symbol, company_name FROM stock_list;
```

`SELECT` 키워드는 위와 같이 사용 가능하다. `*`는 모든 컬럼을 의미한다.  
예를 들어, `SELECT stock_symbol, company_name FROM stock_list;`를 실행하면 다음과 같은 결과를 얻을 수 있다.

| stock_symbol | company_name     |
|--------------|------------------|
| AAPL         | Apple            |
| TSLA         | Tesla            |
| MSFT         | Microsoft        |
| JPM          | JPMorgan Chase   |
| NVDA         | NVIDIA           |

<br>

#### INSERT: 데이터 삽입

```sql
/* Syntax */
INSERT INTO [table_name] ([column_1], [column_2], ...)
VALUES ([value_1], [value_2], ...);


/* Example */
INSERT INTO stock_list (stock_symbol, market) VALUES ('WMT', 'NYSE');
INSERT INTO stock_list VALUES (6, 'ORCL', 'Oracle', 'NYSE'); -- 컬럼명 생략 가능
```

`INSERT` 키워드는 위와 같이 사용 가능하다.  
예를 들어, `INSERT INTO stock_list VALUES (6, 'ORCL', 'Oracle', 'NYSE');`를 실행하면 다음과 같은 결과를 얻을 수 있다.

| company_id | stock_symbol | company_name     | market |
|------------|--------------|------------------|--------|
| 1          | AAPL         | Apple            | NASDAQ |
| 2          | TSLA         | Tesla            | NASDAQ |
| 3          | MSFT         | Microsoft        | NASDAQ |
| 4          | JPM          | JPMorgan Chase   | NYSE   |
| 5          | NVDA         | NVIDIA           | NASDAQ |
| 6          | ORCL         | Oracle           | NYSE   |

<br>

#### WHERE: 조건 지정

```sql
/* Syntax */
SELECT [column_1], [column_2], ... FROM [table_name] WHERE [conditions];


/* Example */
SELECT company_name FROM stock_list WHERE company_id = 3;
SELECT * FROM stock_list WHERE market = 'NASDAQ';
SELECT * FROM stock_list WHERE market = 'NASDAQ' AND stock_symbol = 'AAPL';
```

`WHERE` 키워드는 위와 같이 사용 가능하다.  
예를 들어, `SELECT * FROM stock_list WHERE market = 'NASDAQ' AND stock_symbol = 'AAPL';`를 실행하면 다음과 같은 결과를 얻을 수 있다.

| company_id | stock_symbol | company_name     | market |
|------------|--------------|------------------|--------|
| 1          | AAPL         | Apple            | NASDAQ |

---

### PHP - MySQL 연동

MySQL을 통해 `dev` 데이터베이스를 생성한 후, 다음과 같은 `score` 테이블을 추가하였다.

| id | name   | score |
|----|--------|-------|
| 1  | testee | 100   |

PHP 코드에서 위 테이블의 데이터를 사용하려면 어떻게 해야 할까?  
아래의 `db_check.php` 코드를 보자.

```php
// db_check.php

<?php
  // Database Connection Settings
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');

  // Attempt to Connect to the Database
  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  
  // Check Connection Result and Print the Status
  if ($db_conn) {
    echo "DB Connection Success";
  } else {
    echo "DB Connection Fail";
  }

  // Execute a SQL Query to Retrieve Data
  $sql = "SELECT * FROM score";
  $result = mysqli_query($db_conn, $sql);
  $row = mysqli_fetch_array($result);
  var_dump($row);
  echo "<br>Name: " . $row['name'];
  echo "<br>Score: " . $row['score'];
?>
```
<script>
  (() => {
    window.patchCodeLine = (lineNumber, override) => {
      const code = document.currentScript.previousElementSibling.querySelector('code');

      const patch = () => {
        if (code.classList.contains('language-html')) {
          code.classList.replace('language-html', 'language-php');
        }

        const line = code.querySelector(`.code-line[value="${lineNumber}"]`);
        const lineContent = new DOMParser().parseFromString(override, 'text/html');

        line.replaceChildren(...lineContent.body.childNodes);
        line.appendChild(document.createTextNode('\n'));

        observer.disconnect();
      };

      const observer = new MutationObserver(patch);

      observer.observe(code, { attributes: true, attributeFilter: ['highlighted'] });

      if (code.hasAttribute('highlighted')) patch();
    };

    patchCodeLine(25, [
      '<span style="color:#005CC5">  echo "</span>',
      '<span style="color:#24292E">&lt;</span>',
      '<span style="color:#22863A">br</span>',
      '<span style="color:#24292E">&gt;Name:</span>',
      '<span style="color:#032F62"> "</span>',
      '<span style="color:#D73A49"> .</span>',
      '<span style="color:#24292E"> $row[</span>',
      '<span style="color:#032F62">\'name\'</span>',
      '<span style="color:#24292E">];</span>',
    ].join(''));

    patchCodeLine(26, [
      '<span style="color:#005CC5">  echo "</span>',
      '<span style="color:#24292E">&lt;</span>',
      '<span style="color:#22863A">br</span>',
      '<span style="color:#24292E">&gt;Score:</span>',
      '<span style="color:#032F62"> "</span>',
      '<span style="color:#D73A49"> .</span>',
      '<span style="color:#24292E"> $row[</span>',
      '<span style="color:#032F62">\'score\'</span>',
      '<span style="color:#24292E">];</span>',
    ].join(''));
  })();
</script>

위 코드에서 수행되는 작업은 다음과 같다.

**1\. 데이터베이스 접속 정보 정의:**  
서버 주소, 사용자명, 비밀번호, 사용할 데이터베이스 이름을 `define()` 함수를 이용해 상수로 선언한다.

**2\. 데이터베이스 연결:**  
위에서 정의한 상수들을 `mysqli_connect()` 함수에 인자로 넘겨 데이터베이스 서버에 연결을 시도한다.  
연결 성공 시 `$db_conn` 변수에 연결 객체(데이터베이스와의 연결을 다루는 리소스)가 저장되며, 실패 시 `false`가 저장된다.

**3\. 연결 결과 출력:**  
`$db_conn`이 유효한지 확인해 연결 성공/실패 메시지를 출력한다.

**4\. 쿼리 작성 및 실행:**  
`SELECT * FROM score` 쿼리를 문자열로 작성하여 `$sql`에 저장한다.  
`mysqli_query()` 함수를 이용해 쿼리를 실행하고, 그 결과를 `$result`에 저장한다.

**5\. 결과 처리:**  
`mysqli_fetch_array()`를 통해 `$result`에서 첫 번째 행을 가져와 `$row` 변수에 배열 형태로 저장한다.  
`var_dump()` 함수로 배열 구조를 출력할 수 있으며, 특정 필드의 값만 가져오려면 `$row['name']`과 같이 사용할 수 있다.

`db_check.php` 파일의 실행 결과는 다음과 같다.

![db_check.php](/posts/penetration-testing-week-2/assets/1.webp)

<br>
<br>
<br>

## 과제

### phpMyAdmin

**phpMyAdmin**은 웹 브라우저를 통해 데이터베이스를 관리할 수 있는 GUI 기반 도구이다.  
CLI보다 접근성이 좋고 직관적이기 때문에 설치해두면 매우 유용하다.

phpMyAdmin은 다음 절차를 통해 사용할 수 있다.

<br>

#### 1\. phpMyAdmin 설치

터미널에서 다음 명령어를 실행한다.

```sh
sudo apt install phpmyadmin
```

<br>

#### 2\. 심볼릭 링크 설정

phpMyAdmin의 기본 경로는 `/usr/share/phpmyadmin`이다. 이를 Apache의 웹 서버 디렉터리인 `/var/www/html`에 심볼릭 링크로 연결하여 웹 브라우저에서 phpMyAdmin에 접근할 수 있도록 한다.

```sh
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

> **심볼릭 링크(Symbolic Link)**
>
> 특정 파일이나 디렉터리에 대한 참조를 포함하는 특별한 파일로, Windows의 바로가기와 비슷한 개념이다.

<br>

#### 3\. Apache 웹 서버 재시작

심볼릭 링크를 생성한 후 Apache 웹 서버를 재시작한다.

```sh
sudo systemctl restart apache2
```

이제 웹 브라우저에서 `http://x.x.x.x/phpmyadmin`을 입력하여 phpMyAdmin에 접속할 수 있다.  

![phpMyAdmin](/posts/penetration-testing-week-2/assets/2.webp)

---

### 점수 조회 페이지

위의 `score` 테이블을 사용하여, GET 방식으로 이름을 전달받아 점수를 출력하는 코드를 만들어 보자.  
`db_test.php`를 약간 수정하여 해당 기능을 구현할 수 있다.

<style id="code-3">
  #code-3 + pre data[value="19"] span:nth-of-type(9) {color: #032F62 !important;}
</style>
```php
// get_score.php

<form method="GET">
  <label for="name">Name:</label>
  <input type="text" name="name">
  <button type="submit">Submit</button>
</form>

<?php
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');

  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  if (isset($_GET['name'])) {
    $name = $_GET['name'];
    $sql = "SELECT * FROM score WHERE name = '$name'";
    $result = mysqli_query($db_conn, $sql);
    $row = mysqli_fetch_array($result);

    echo $row['name'] . "'s score is " . $row['score'];
  }
?>
```
<script>
  patchCodeLine(3, [
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">form</span>',
    '<span style="color:#6F42C1"> method</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"GET"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(4, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">label</span>',
    '<span style="color:#6F42C1"> for</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"name"</span>',
    '<span style="color:#24292E">&gt;Name:&lt;/</span>',
    '<span style="color:#22863A">label</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(5, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">input</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"text"</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"name"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(6, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">button</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"submit"</span>',
    '<span style="color:#24292E">&gt;Submit&lt;/</span>',
    '<span style="color:#22863A">button</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(7, [
    '<span style="color:#24292E">&lt;/</span>',
    '<span style="color:#22863A">form</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));
</script>

사용자가 이름을 입력하고 제출하면, 해당 이름과 일치하는 데이터를 데이터베이스에서 찾아 점수를 출력한다.
`get_score.php`의 실행 결과는 아래와 같다.

![get_score.php](/posts/penetration-testing-week-2/assets/3.webp)
![get_score.php](/posts/penetration-testing-week-2/assets/4.webp)

---

### 회원 가입 페이지

phpMyAdmin을 통해 `dev` 데이터베이스에 다음과 같은 `users` 테이블을 추가하였다.

![users](/posts/penetration-testing-week-2/assets/5.webp)

회원 가입 페이지에서는 사용자로부터 정보를 입력받아 `users` 테이블에 저장한다.  
1주 차에 제작했던 로그인 페이지 역시 데이터베이스와 연동시켜 보자.

파일 구성은 다음과 같다.

- `sign_up.php`: 회원 가입 폼을 담당하는 파일
- `login.php`: 로그인 입력 폼을 담당하는 파일
- `login_proc.php`: 로그인 정보를 처리하는 서버 측 코드
- `style.css`: 전체 스타일을 정의한 CSS 파일

<br>

#### 1. 회원 가입 폼(sign_up.php)

사용자 이름, 이메일, 아이디, 비밀번호를 입력받아 `dev` 데이터베이스의 `users` 테이블에 저장하는 폼으로 구성되어 있다.  
이미 계정이 존재하는 사용자를 위해 로그인 페이지로 이동할 수 있는 링크가 포함되어 있다.    
회원 가입 시 `username`이 중복될 경우 경고 메시지를 출력한다.  
회원 가입이 완료되면 `login.php?sign_up=success`로 이동한다.

<style id="code-4">
  #code-4 + pre data[value="29"] span:is(:nth-of-type(6), :nth-of-type(8)) {color: #032F62 !important;}
</style>
```php
// sign_up.php

<?php
  // Database connection settings
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');

  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  // Get form data
  $name = $_POST['name'];
  $email = $_POST['email'];
  $username = $_POST['username'];
  $password = $_POST['password'];

  // Check if the username already exists in the database
  if ($username) {
    $sql_check_username = "SELECT * FROM users WHERE username = '$username'";
    $result_check = mysqli_query($db_conn, $sql_check_username);

    // If username already exists
    if (mysqli_num_rows($result_check) > 0) {
      echo "<script>alert('Username already exists. Please choose a different username.');</script>";
    } else {
      // Insert user information into the database if username is available
      if ($name && $email && $username && $password) {
        $sql_insert = "INSERT INTO users (name, email, username, password) VALUES ('$name', '$email', '$username', '$password')";
        $result_insert = mysqli_query($db_conn, $sql_insert);

        // Check if the sign up process was successful
        if ($result_insert) {
          // Redirect to login.php with success message in query string
          header("Location: login.php?sign_up=success");
          exit;
        } else {
          // Display error alert if there was an issue
          echo "<script>alert('An error occurred while signing up.');</script>";
        }
      }
    }
  }
?>

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    // Container that holds the sign up form
    <div class="signup-container">
      <h1>Sign Up</h1>

      // Sign up form
      <form method="POST">
        <input type="text" name="name" placeholder="Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>

        <button type="submit">Sign Up</button>
      </form>

      // Link to login page for users who already have an account
      <a href="login.php">Already have an account? Login here</a>
    </div>
  </body>
</html>
```
<script>
  patchCodeLine(25, [
    '<span style="color:#005CC5">      echo</span>',
    '<span style="color:#032F62"> "</span>',
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">script</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#6F42C1">alert</span>',
    '<span style="color:#24292E">(</span>',
    '<span style="color:#032F62">\'Username already exists. Please choose a different username.\'</span>',
    '<span style="color:#24292E">);&lt;/</span>',
    '<span style="color:#22863A">script</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#032F62">"</span>',
    '<span style="color:#24292E">;</span>',
  ].join(''));

  patchCodeLine(39, [
    '<span style="color:#005CC5">          echo</span>',
    '<span style="color:#032F62"> "</span>',
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">script</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#6F42C1">alert</span>',
    '<span style="color:#24292E">(</span>',
    '<span style="color:#032F62">\'An error occurred while signing up.\'</span>',
    '<span style="color:#24292E">);&lt;/</span>',
    '<span style="color:#22863A">script</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#032F62">"</span>',
    '<span style="color:#24292E">;</span>',
  ].join(''));

  patchCodeLine(46, [
    '<span style="color:#24292E">&lt;!</span>',
    '<span style="color:#22863A">DOCTYPE</span>',
    '<span style="color:#6F42C1"> html</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(47, [
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">html</span>',
    '<span style="color:#6F42C1"> lang</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"ko"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(48, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">head</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(49, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">meta</span>',
    '<span style="color:#6F42C1"> charset</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"UTF-8"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(50, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">meta</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"viewport"</span>',
    '<span style="color:#6F42C1"> content</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"width=device-width, initial-scale=1.0"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(51, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">title</span>',
    '<span style="color:#24292E">&gt;Sign Up&lt;/</span>',
    '<span style="color:#22863A">title</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(52, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">link</span>',
    '<span style="color:#6F42C1"> rel</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"stylesheet"</span>',
    '<span style="color:#6F42C1"> href</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"style.css"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(53, [
    '<span style="color:#24292E">  &lt;/</span>',
    '<span style="color:#22863A">head</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(54, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">body</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(56, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">div</span>',
    '<span style="color:#6F42C1"> class</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"signup-container"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(57, [
    '<span style="color:#24292E">      &lt;</span>',
    '<span style="color:#22863A">h1</span>',
    '<span style="color:#24292E">&gt;Sign Up&lt;/</span>',
    '<span style="color:#22863A">h1</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(60, [
    '<span style="color:#24292E">      &lt;</span>',
    '<span style="color:#22863A">form</span>',
    '<span style="color:#6F42C1"> method</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"POST"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(61, [
    '<span style="color:#24292E">        &lt;</span>',
    '<span style="color:#22863A">input</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"text"</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"name"</span>',
    '<span style="color:#6F42C1"> placeholder</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"Name"</span>',
    '<span style="color:#6F42C1"> required</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(62, [
    '<span style="color:#24292E">        &lt;</span>',
    '<span style="color:#22863A">input</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"email"</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"email"</span>',
    '<span style="color:#6F42C1"> placeholder</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"Email"</span>',
    '<span style="color:#6F42C1"> required</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(63, [
    '<span style="color:#24292E">        &lt;</span>',
    '<span style="color:#22863A">input</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"text"</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"username"</span>',
    '<span style="color:#6F42C1"> placeholder</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"Username"</span>',
    '<span style="color:#6F42C1"> required</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(64, [
    '<span style="color:#24292E">        &lt;</span>',
    '<span style="color:#22863A">input</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"password"</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"password"</span>',
    '<span style="color:#6F42C1"> placeholder</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"Password"</span>',
    '<span style="color:#6F42C1"> required</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(66, [
    '<span style="color:#24292E">        &lt;</span>',
    '<span style="color:#22863A">button</span>',
    '<span style="color:#6F42C1"> type</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"submit"</span>',
    '<span style="color:#24292E">&gt;Sign Up&lt;/</span>',
    '<span style="color:#22863A">button</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(67, [
    '<span style="color:#24292E">      &lt;/</span>',
    '<span style="color:#22863A">form</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(70, [
    '<span style="color:#24292E">      &lt;</span>',
    '<span style="color:#22863A">a</span>',
    '<span style="color:#6F42C1"> href</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"login.php"</span>',
    '<span style="color:#24292E">&gt;Already have an account? Login here&lt;/</span>',
    '<span style="color:#22863A">a</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(71, [
    '<span style="color:#24292E">    &lt;/</span>',
    '<span style="color:#22863A">div</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(72, [
    '<span style="color:#24292E">  &lt;/</span>',
    '<span style="color:#22863A">body</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(73, [
    '<span style="color:#24292E">&lt;/</span>',
    '<span style="color:#22863A">html</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));
</script>

<br>

#### 2. 로그인 입력 폼(login.php)

회원 가입 완료 후 URL에 `sign_up=success` 쿼리 스트링이 포함된 경우, 알림 창을 통해 회원 가입 성공 메시지를 표시한다.  
계정이 없는 사용자를 위해 회원 가입 페이지로 이동할 수 있는 링크가 포함되어 있다.

<style id="code-5">
  #code-5 + pre data:is([value="1"], [value="20"], [value="26"]) span {color: #6A737D !important;}
</style>
```html
// login.php

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
    <link rel="stylesheet" href="style.css">
  </head>

  <body>
    <div class="login-container">
      <h2>Login</h2>
      <form action="login_proc.php" method="POST">
        <input type="text" name="username" placeholder="ID">
        <input type="password" name="password" placeholder="PW">
        <button type="submit">Login</button>

        // Link to sign up page for new users
        <a href="sign_up.php">Don't have an account? Sign up here</a>
        
      </form>
    </div>

    // JavaScipt to show alert if sign up completed
    <script>
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('sign_up') === 'success') {
        alert('Sign up completed successfully!');
      }
    </script>
  </body>
</html>
```

<br>

#### 3. 로그인 처리(login_proc.php)

`login.php`로부터 전달받은 아이디와 비밀번호를 데이터베이스에 저장된 정보와 비교하여 로그인 여부를 판별한다.  
로그인 성공 시 성공 메시지를, 실패 시 실패 원인에 따라 다른 메시지를 출력한다.

```php
// login_proc.php

<?php
  // Database connection settings
  define('DB_SERVER', 'localhost');
  define('DB_USERNAME', 'root');
  define('DB_PASSWORD', 'root');
  define('DB_NAME', 'dev');
  $db_conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  // Initialize message variable
  $message = "";

  // Get form data(username and password)
  $username = $_POST['username'];
  $password = $_POST['password'];

  // Query the database for the username
  $sql = "SELECT * FROM users WHERE username = '$username'";
  $result = mysqli_query($db_conn, $sql);

  // Check if the user exists
  if (mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_array($result);

    // Check if the password matches
    if ($user['password'] === $password) {
      // Login success message
      $message = "<p style='color: green;'>Login Successful!</p>";
    } else {
      // Login failure due to incorrect password
      $message = "<p style='color: red;'>Login Failed. Incorrect password.</p>";
    }
  } else {
    // Login failure due to username not found
    $message = "<p style='color: red;'>Login Failed. Username not Found.</p>";
  }
?>

<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Result</title>
    <link rel="stylesheet" href="style.css">
  </head>

  <body>
    <div class="login-container">
      <?php echo $message; ?>
      <button>
      <a href="login.php">Back to Login Page</a>
      </button>
    </div>
  </body>
</html>
```
<script>
  patchCodeLine(29, [
    '<span style="color:#24292E">      $message </span>',
    '<span style="color:#D73A49">=</span>',
    '<span style="color:#032F62"> "</span>',
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">p</span>',
    '<span style="color:#6F42C1"> style</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">\'color: green;\'</span>',
    '<span style="color:#24292E">&gt;Login Successful!&lt;/</span>',
    '<span style="color:#22863A">p</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#032F62">"</span>',
    '<span style="color:#24292E">;</span>',
  ].join(''));

  patchCodeLine(32, [
    '<span style="color:#24292E">      $message </span>',
    '<span style="color:#D73A49">=</span>',
    '<span style="color:#032F62"> "</span>',
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">p</span>',
    '<span style="color:#6F42C1"> style</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">\'color: red;\'</span>',
    '<span style="color:#24292E">&gt;Login Failed. Incorrect password.&lt;/</span>',
    '<span style="color:#22863A">p</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#032F62">"</span>',
    '<span style="color:#24292E">;</span>',
  ].join(''));

  patchCodeLine(36, [
    '<span style="color:#24292E">    $message </span>',
    '<span style="color:#D73A49">=</span>',
    '<span style="color:#032F62"> "</span>',
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">p</span>',
    '<span style="color:#6F42C1"> style</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">\'color: red;\'</span>',
    '<span style="color:#24292E">&gt;Login Failed. Username not Found.&lt;/</span>',
    '<span style="color:#22863A">p</span>',
    '<span style="color:#24292E">&gt;</span>',
    '<span style="color:#032F62">"</span>',
    '<span style="color:#24292E">;</span>',
  ].join(''));

  patchCodeLine(40, [
    '<span style="color:#24292E">&lt;!</span>',
    '<span style="color:#22863A">DOCTYPE</span>',
    '<span style="color:#6F42C1"> html</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(41, [
    '<span style="color:#24292E">&lt;</span>',
    '<span style="color:#22863A">html</span>',
    '<span style="color:#6F42C1"> lang</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"ko"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(42, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">head</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(43, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">meta</span>',
    '<span style="color:#6F42C1"> charset</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"UTF-8"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(44, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">meta</span>',
    '<span style="color:#6F42C1"> name</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"viewport"</span>',
    '<span style="color:#6F42C1"> content</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"width=device-width, initial-scale=1.0"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(45, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">title</span>',
    '<span style="color:#24292E">&gt;Login Result&lt;/</span>',
    '<span style="color:#22863A">title</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(46, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">link</span>',
    '<span style="color:#6F42C1"> rel</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"stylesheet"</span>',
    '<span style="color:#6F42C1"> href</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"style.css"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(47, [
    '<span style="color:#24292E">  &lt;/</span>',
    '<span style="color:#22863A">head</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(49, [
    '<span style="color:#24292E">  &lt;</span>',
    '<span style="color:#22863A">body</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(50, [
    '<span style="color:#24292E">    &lt;</span>',
    '<span style="color:#22863A">div</span>',
    '<span style="color:#6F42C1"> class</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"login-container"</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(52, [
    '<span style="color:#24292E">      &lt;</span>',
    '<span style="color:#22863A">button</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(53, [
    '<span style="color:#24292E">      &lt;</span>',
    '<span style="color:#22863A">a</span>',
    '<span style="color:#6F42C1"> href</span>',
    '<span style="color:#24292E">=</span>',
    '<span style="color:#032F62">"login.php"</span>',
    '<span style="color:#24292E">&gt;Back to Login Page&lt;/</span>',
    '<span style="color:#22863A">a</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(54, [
    '<span style="color:#24292E">      &lt;/</span>',
    '<span style="color:#22863A">button</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(55, [
    '<span style="color:#24292E">    &lt;/</span>',
    '<span style="color:#22863A">div</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(56, [
    '<span style="color:#24292E">  &lt;/</span>',
    '<span style="color:#22863A">body</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));

  patchCodeLine(57, [
    '<span style="color:#24292E">&lt;/</span>',
    '<span style="color:#22863A">html</span>',
    '<span style="color:#24292E">&gt;</span>',
  ].join(''));
</script>

<br>

#### 4. 스타일 정의(style.css)

로그인 페이지와 회원 가입 페이지에 공통으로 적용되는 일관된 스타일을 정의한다.

```css
/* style.css */

body {
  display: flex;
  height: 100vh;
  margin: 0;
  background-color: gray;
  font-family: Arial, sans-serif;
  justify-content: center;
  align-items: center;
}

.signup-container,
.login-container {
  width: 300px;
  padding: 30px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

input {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid gray;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

button {
  width: 100%;
  margin: 20px 0;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #a78bfa;
  color: white;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #8b5cf6;
  }
}

a {
  display: block;
  color: #a78bfa;

  button & {
    color: white;
    text-decoration: none;
  }
}
```
<script>
  patchCodeLine(44, [
    '<span style="color:#22863A">  &amp;</span>',
    '<span style="color:#6F42C1">:hover</span>',
    '<span style="color:#24292E"> {</span>'
  ].join(''));

  patchCodeLine(45, [
    '<span style="color:#005CC5">    background-color</span>',
    '<span style="color:#24292E">: </span>',
    '<span style="color:#005CC5">#8b5cf6</span>',
    '<span style="color:#24292E">;</span>'
  ].join(''));

  patchCodeLine(53, [
    '<span style="color:#22863A">  button &amp;</span>',
    '<span style="color:#24292E"> {</span>'
  ].join(''));
</script>

<br>

#### 실행 결과

브라우저에서 `http://x.x.x.x/sign_up.php`로 접속하면 다음과 같은 회원 가입 페이지가 나타난다.  

![회원 가입 페이지](/posts/penetration-testing-week-2/assets/6.webp)

필요한 정보를 입력하고 폼을 제출하면, `login.php?sign_up=success`로 리다이렉트되며 회원 가입 성공 알림 창이 뜬다.

![회원 가입 성공](/posts/penetration-testing-week-2/assets/7.webp)

이때 `users` 테이블을 확인해 보면 다음과 같이 레코드가 추가되었음을 알 수 있다.

![users 테이블](/posts/penetration-testing-week-2/assets/8.webp){: style="padding: 0 12.5%; background-color: white"}

`test` 사용자가 데이터베이스에 등록된 이후 다시 `test`라는 `username`으로 중복 회원 가입 시도를 하면 다음과 같은 알림 창이 표시된다.

![중복 회원 가입 시도](/posts/penetration-testing-week-2/assets/9.webp)

회원 가입 성공 후 알림 창을 닫으면 다음과 같이 로그인 페이지로 이동한다.

![로그인 페이지](/posts/penetration-testing-week-2/assets/10.webp)

`test`/`test`를 입력하여 로그인에 성공하면 로그인 성공 화면으로 이동한다.

![로그인 성공](/posts/penetration-testing-week-2/assets/11.webp)

`test`/`tset`과 같이 잘못된 비밀번호를 입력하면 비밀번호 불일치로 인한 로그인 실패 메시지가 출력된다.

![로그인 실패](/posts/penetration-testing-week-2/assets/12.webp)

현재 데이터베이스에 등록되지 않은 아이디를 통해 로그인을 시도하면 `username`이 존재하지 않는다는 메시지가 출력된다.

![로그인 실패](/posts/penetration-testing-week-2/assets/13.webp)