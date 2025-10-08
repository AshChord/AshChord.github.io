--- meta
title: Penetration Testing | Week 2
date: 2025/04/14
excerpt: 데이터베이스 연동 및 기본 SQL 쿼리 구조
categories: 모의 해킹
---

### 강의 노트

#### 로그인 페이지 구조

1주차 과제로 PHP를 활용해 간단한 로그인 페이지를 제작했다.  
이번에는 실제 서비스 구조에 조금 더 가까운 흐름을 설계해 보자.

- 메인 페이지는 `index.php`이다.
- 사용자가 로그인하지 않은 상태로 접근하면 자동으로 `login.php`로 리다이렉트된다.
- 로그인한 사용자라면 사용자 정보를 포함해 `index.php`가 정상적으로 출력된다.

이러한 흐름을 구현하기 위해서, 다음과 같은 `index.php` 코드를 생각해 볼 수 있다.

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

#### 데이터베이스

**데이터베이스**란 웹 애플리케이션에서 필요한 데이터를 저장 및 관리하는 시스템을 말한다. 흔히 사용하는 엑셀 프로그램과 구조적으로 유사한 점이 있는데, 데이터베이스의 주요 개념은 엑셀의 구성 요소와 다음과 같이 비교할 수 있다.

<table>
  <thead>
    <tr>
      <th style="width: 25%;">데이터베이스 주요 개념</th>
      <th style="width: 30%;">엑셀 구성 요소</th>
      <th style="width: 45%;">설명</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>데이터베이스(Broadly)</td>
      <td>엑셀 프로그램 전체</td>
      <td>데이터를 저장·관리하는 전체 시스템 혹은 기술 영역</td>
    </tr>
    <tr>
      <td>데이터베이스(Narrowly)</td>
      <td>엑셀 파일</td>
      <td>데이터가 저장되는 구조적 공간</td>
    </tr>
    <tr>
      <td>테이블</td>
      <td>엑셀 시트</td>
      <td>행과 열로 이루어진 데이터 집합</td>
    </tr>
    <tr>
      <td>레코드</td>
      <td>엑셀 시트의 한 행(Row)</td>
      <td>하나의 데이터 항목(한 사람, 한 거래 등)</td>
    </tr>
    <tr>
      <td>필드</td>
      <td>엑셀 시트의 한 열(Column)</td>
      <td>데이터의 속성(이름, 나이, 이메일 등)</td>
    </tr>
  </tbody>
</table>

---

#### SQL

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

##### SELECT: 데이터 조회

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

##### INSERT: 데이터 삽입

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

##### WHERE: 조건 지정

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

#### PHP - MySQL 연동

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
  $sql = "select * from score"; 
  $result = mysqli_query($db_conn, $sql);
  $row = mysqli_fetch_array($result);
  var_dump($row);
  echo "<br>Name: " . $row['name'];
  echo "<br>Score: " . $row['score'];
?>
```

위 코드에서 수행되는 작업은 다음과 같다.

**1\. 데이터베이스 접속 정보 정의:**  
서버 주소, 사용자명, 비밀번호, 사용할 데이터베이스 이름을 `define()` 함수를 이용해 상수로 선언한다.

**2\. 데이터베이스 연결:**  
위에서 정의한 상수들을`mysqli_connect()` 함수에 인자로 넘겨 데이터베이스 서버에 연결을 시도한다.  
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

![db_check.php](/data/Penetration%20Testing%20%7C%20Week%202/1.png)

<br>
<br>
<br>

### 과제

#### phpMyAdmin

**phpMyAdmin**은 웹 브라우저를 통해 데이터베이스를 관리할 수 있는 GUI 기반 도구이다.  
CLI보다 접근성이 좋고 직관적이기 때문에 설치해두면 매우 유용하다.

phpMyAdmin은 다음 절차를 통해 사용할 수 있다.

<br>

##### 1\. phpMyAdmin 설치

터미널에서 다음 명령어를 실행한다.

```bash
sudo apt install phpmyadmin
```

<br>

##### 2\. 심볼릭 링크 설정

phpMyAdmin의 기본 경로는 `/usr/share/phpmyadmin`이다. 이를 Apache의 웹 서버 디렉토리인 `/var/www/html`에 심볼릭 링크로 연결하여 웹 브라우저에서 phpMyAdmin에 접근할 수 있도록 한다.

```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

> **심볼릭 링크(Symbolic Link)**
>
> 특정 파일이나 디렉터리에 대한 참조를 포함하는 특별한 파일로, Windows의 바로가기와 비슷한 개념이다.

<br>

##### 3\. Apache 웹 서버 재시작

심볼릭 링크를 생성한 후 Apache 웹 서버를 재시작한다.

```bash
sudo systemctl restart apache2
```

이제 웹 브라우저에서 `http://x.x.x.x/phpmyadmin`을 입력하여 phpMyAdmin에 접속할 수 있다.  

![phpMyAdmin](/data/Penetration%20Testing%20%7C%20Week%202/2.png)

---

#### 점수 조회 페이지

위의 `score` 테이블을 사용하여, GET 방식으로 이름을 전달받아 점수를 출력하는 코드를 만들어 보자.  
`db_test.php`를 약간 수정하여 해당 기능을 구현할 수 있다.

<style>
  .hljs-subst {
    color: #e36209;
  }
</style>

<pre><code class="language-php hljs" data-highlighted="yes"><span class="hljs-comment">// get_score.php</span>

<span class="hljs-tag">&lt;<span class="hljs-name">form</span> <span class="hljs-attr">method</span>=<span class="hljs-string">"GET"</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">label</span> <span class="hljs-attr">for</span>=<span class="hljs-string">"name"</span>&gt;</span>Name:<span class="hljs-tag">&lt;/<span class="hljs-name">label</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"text"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"name"</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">button</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"submit"</span>&gt;</span>Submit<span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span>
<span class="hljs-tag">&lt;/<span class="hljs-name">form</span>&gt;</span>

<span class="hljs-meta">&lt;?php</span>
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_SERVER'</span>, <span class="hljs-string">'localhost'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_USERNAME'</span>, <span class="hljs-string">'root'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_PASSWORD'</span>, <span class="hljs-string">'root'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_NAME'</span>, <span class="hljs-string">'dev'</span>);

  <span class="hljs-variable">$db_conn</span> = <span class="hljs-title function_ invoke__">mysqli_connect</span>(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  <span class="hljs-keyword">if</span> (<span class="hljs-keyword">isset</span>(<span class="hljs-variable">$_GET</span>[<span class="hljs-string">'name'</span>])) {
    <span class="hljs-variable">$name</span> = <span class="hljs-variable">$_GET</span>[<span class="hljs-string">'name'</span>];
    <span class="hljs-variable">$sql</span> = <span class="hljs-string">"SELECT * FROM score WHERE name = '<span class="hljs-subst">$name</span>'"</span>;
    <span class="hljs-variable">$result</span> = <span class="hljs-title function_ invoke__">mysqli_query</span>(<span class="hljs-variable">$db_conn</span>, <span class="hljs-variable">$sql</span>);
    <span class="hljs-variable">$row</span> = <span class="hljs-title function_ invoke__">mysqli_fetch_array</span>(<span class="hljs-variable">$result</span>);

    <span class="hljs-keyword">echo</span> <span class="hljs-variable">$row</span>[<span class="hljs-string">'name'</span>] . <span class="hljs-string">"'s score is "</span> . <span class="hljs-variable">$row</span>[<span class="hljs-string">'score'</span>];
  }
<span class="hljs-meta">?&gt;</span>
</code></pre>

사용자가 이름을 입력하고 제출하면, 해당 이름과 일치하는 데이터를 데이터베이스에서 찾아 점수를 출력한다.
`get_score.php`의 실행 결과는 아래와 같다.

![get_score.php](/data/Penetration%20Testing%20%7C%20Week%202/3.png)
![get_score.php](/data/Penetration%20Testing%20%7C%20Week%202/4.png)

---

#### 회원 가입 페이지

phpMyAdmin을 통해 `dev` 데이터베이스에 다음과 같은 `users` 테이블을 추가하였다.

![users](/data/Penetration%20Testing%20%7C%20Week%202/5.png)

회원 가입 페이지에서는 사용자로부터 정보를 입력받아 `users` 테이블에 저장한다.  
1주차에 제작했던 로그인 페이지 역시 데이터베이스와 연동시켜 보자.

파일 구성은 다음과 같다.

- `sign_up.php`: 회원 가입 폼을 담당하는 파일
- `login.php`: 로그인 입력 폼을 담당하는 파일
- `login_proc.php`: 로그인 정보를 처리하는 서버 측 코드
- `style.css`: 전체 스타일을 정의한 CSS 파일

<br>

##### 1. 회원 가입 폼(sign_up.php)

사용자 이름, 이메일, 아이디, 비밀번호를 입력받아 `dev` 데이터베이스의 `users` 테이블에 저장하는 폼으로 구성되어 있다.  
이미 계정이 존재하는 사용자를 위해 로그인 페이지로 이동할 수 있는 링크가 포함되어 있다.    
회원 가입 시 `username`이 중복될 경우 경고 메시지를 출력한다.  
회원 가입이 완료되면 `login.php?sign_up=success`로 이동한다.

<pre><code class="language-php hljs" data-highlighted="yes"><span class="hljs-comment">// sign_up.php</span>

<span class="hljs-meta">&lt;?php</span>
  <span class="hljs-comment">// Database connection settings</span>
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_SERVER'</span>, <span class="hljs-string">'localhost'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_USERNAME'</span>, <span class="hljs-string">'root'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_PASSWORD'</span>, <span class="hljs-string">'root'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_NAME'</span>, <span class="hljs-string">'dev'</span>);

  <span class="hljs-variable">$db_conn</span> = <span class="hljs-title function_ invoke__">mysqli_connect</span>(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  <span class="hljs-comment">// Get form data</span>
  <span class="hljs-variable">$name</span> = <span class="hljs-variable">$_POST</span>[<span class="hljs-string">'name'</span>];
  <span class="hljs-variable">$email</span> = <span class="hljs-variable">$_POST</span>[<span class="hljs-string">'email'</span>];
  <span class="hljs-variable">$username</span> = <span class="hljs-variable">$_POST</span>[<span class="hljs-string">'username'</span>];
  <span class="hljs-variable">$password</span> = <span class="hljs-variable">$_POST</span>[<span class="hljs-string">'password'</span>];

  <span class="hljs-comment">// Check if the username already exists in the database</span>
  <span class="hljs-keyword">if</span> (<span class="hljs-variable">$username</span>) {
    <span class="hljs-variable">$sql_check_username</span> = <span class="hljs-string">"SELECT * FROM users WHERE username = '<span class="hljs-subst">$username</span>'"</span>;
    <span class="hljs-variable">$result_check</span> = <span class="hljs-title function_ invoke__">mysqli_query</span>(<span class="hljs-variable">$db_conn</span>, <span class="hljs-variable">$sql_check_username</span>);

    <span class="hljs-comment">// If username already exists</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-title function_ invoke__">mysqli_num_rows</span>(<span class="hljs-variable">$result_check</span>) &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">echo</span> <span class="hljs-string">"&lt;script&gt;alert('Username already exists. Please choose a different username.</span>
      <span class="hljs-string">');&lt;/script&gt;"</span>;
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-comment">// Insert user information into the database if username is available</span>
      <span class="hljs-keyword">if</span> (<span class="hljs-variable">$name</span> &amp;&amp; <span class="hljs-variable">$email</span> &amp;&amp; <span class="hljs-variable">$username</span> &amp;&amp; <span class="hljs-variable">$password</span>) {
        <span class="hljs-variable">$sql_insert</span> = <span class="hljs-string">"INSERT INTO users (name, email, username, password) VALUES 
        ('<span class="hljs-subst">$name</span>', '<span class="hljs-subst">$email</span>', '<span class="hljs-subst">$username</span>', '<span class="hljs-subst">$password</span>')"</span>;
        <span class="hljs-variable">$result_insert</span> = <span class="hljs-title function_ invoke__">mysqli_query</span>(<span class="hljs-variable">$db_conn</span>, <span class="hljs-variable">$sql_insert</span>);

        <span class="hljs-comment">// Check if the sign up process was successful</span>
        <span class="hljs-keyword">if</span> (<span class="hljs-variable">$result_insert</span>) {
          <span class="hljs-comment">// Redirect to login.php with success message in query string</span>
          <span class="hljs-title function_ invoke__">header</span>(<span class="hljs-string">"Location: login.php?sign_up=success"</span>);
          <span class="hljs-keyword">exit</span>;
        } <span class="hljs-keyword">else</span> {
          <span class="hljs-comment">// Display error alert if there was an issue</span>
          <span class="hljs-keyword">echo</span> <span class="hljs-string">"&lt;script&gt;alert('An error occurred while signing up.');&lt;/script&gt;"</span>;
        }
      }
    }
  }
<span class="hljs-meta">?&gt;</span>

<span class="hljs-meta">&lt;!DOCTYPE <span class="hljs-keyword">html</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">html</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ko"</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">head</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">charset</span>=<span class="hljs-string">"UTF-8"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"viewport"</span> <span class="hljs-attr">content</span>=<span class="hljs-string">"width=device-width, initial-scale=1.0"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">title</span>&gt;</span>Sign Up<span class="hljs-tag">&lt;/<span class="hljs-name">title</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">link</span> <span class="hljs-attr">rel</span>=<span class="hljs-string">"stylesheet"</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"style.css"</span>&gt;</span>
  <span class="hljs-tag">&lt;/<span class="hljs-name">head</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">body</span>&gt;</span>
    <span class="hljs-comment">// Container that holds the sign up form</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"signup-container"</span>&gt;</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">h1</span>&gt;</span>Sign Up<span class="hljs-tag">&lt;/<span class="hljs-name">h1</span>&gt;</span>

      <span class="hljs-comment">// Sign up form</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">form</span> <span class="hljs-attr">method</span>=<span class="hljs-string">"POST"</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"text"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"name"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">"Name"</span> <span class="hljs-attr">required</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"email"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"email"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">"Email"</span> <span class="hljs-attr">required</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"text"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"username"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">"Username"</span> <span class="hljs-attr">required</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"password"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"password"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">"Password"</span> <span class="hljs-attr">required</span>&gt;</span>

        <span class="hljs-tag">&lt;<span class="hljs-name">button</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"submit"</span>&gt;</span>Sign Up<span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span>
      <span class="hljs-tag">&lt;/<span class="hljs-name">form</span>&gt;</span>

      <span class="hljs-comment">// Link to login page for users who already have an account</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">a</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"login.php"</span>&gt;</span>Already have an account? Login here<span class="hljs-tag">&lt;/<span class="hljs-name">a</span>&gt;</span>
    <span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>
  <span class="hljs-tag">&lt;/<span class="hljs-name">body</span>&gt;</span>
<span class="hljs-tag">&lt;/<span class="hljs-name">html</span>&gt;</span>
</code></pre>

<br>

##### 2. 로그인 입력 폼(login.php)

회원 가입 완료 후 URL에 `sign_up=success` 쿼리 스트링이 포함된 경우, 알림 창을 통해 회원 가입 성공 메시지를 표시한다.  
계정이 없는 사용자를 위해 회원 가입 페이지로 이동할 수 있는 링크가 포함되어 있다.

<pre><code class="language-php hljs" data-highlighted="yes"><span class="hljs-comment">// login.php</span>

<span class="hljs-meta">&lt;!DOCTYPE <span class="hljs-keyword">html</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">html</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ko"</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">head</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">charset</span>=<span class="hljs-string">"UTF-8"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"viewport"</span> <span class="hljs-attr">content</span>=<span class="hljs-string">"width=device-width, initial-scale=1.0"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">title</span>&gt;</span>Login Page<span class="hljs-tag">&lt;/<span class="hljs-name">title</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">link</span> <span class="hljs-attr">rel</span>=<span class="hljs-string">"stylesheet"</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"style.css"</span>&gt;</span>
  <span class="hljs-tag">&lt;/<span class="hljs-name">head</span>&gt;</span>

  <span class="hljs-tag">&lt;<span class="hljs-name">body</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"login-container"</span>&gt;</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">h2</span>&gt;</span>Login<span class="hljs-tag">&lt;/<span class="hljs-name">h2</span>&gt;</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">form</span> <span class="hljs-attr">action</span>=<span class="hljs-string">"login_proc.php"</span> <span class="hljs-attr">method</span>=<span class="hljs-string">"POST"</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"text"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"username"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">"ID"</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"password"</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"password"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">"PW"</span>&gt;</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">button</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"submit"</span>&gt;</span>Login<span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span>

        <span class="hljs-comment">// Link to sign up page for new users</span>
        <span class="hljs-tag">&lt;<span class="hljs-name">a</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"sign_up.php"</span>&gt;</span>Don't have an account? Sign up here<span class="hljs-tag">&lt;/<span class="hljs-name">a</span>&gt;</span>
        
      <span class="hljs-tag">&lt;/<span class="hljs-name">form</span>&gt;</span>
    <span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>

    <span class="hljs-comment">// JavaScipt to show alert if sign up completed</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-javascript">
      <span class="hljs-keyword">const</span> urlParams = <span class="hljs-keyword">new</span> <span class="hljs-title class_">URLSearchParams</span>(<span class="hljs-variable language_">window</span>.<span class="hljs-property">location</span>.<span class="hljs-property">search</span>);
      <span class="hljs-keyword">if</span> (urlParams.<span class="hljs-title function_">get</span>(<span class="hljs-string">'sign_up'</span>) === <span class="hljs-string">'success'</span>) {
        <span class="hljs-title function_">alert</span>(<span class="hljs-string">'Sign up completed successfully!'</span>);
      }
    </span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
  <span class="hljs-tag">&lt;/<span class="hljs-name">body</span>&gt;</span>
<span class="hljs-tag">&lt;/<span class="hljs-name">html</span>&gt;</span>
</code></pre>

<br>

##### 3. 로그인 처리(login_proc.php)

`login.php`로부터 전달받은 아이디와 비밀번호를 데이터베이스에 저장된 정보와 비교하여 로그인 여부를 판별한다.  
로그인 성공 시 성공 메시지를, 실패 시 실패 원인에 따라 다른 메시지를 출력한다.

<pre><code class="language-php hljs" data-highlighted="yes"><span class="hljs-comment">// login_proc.php</span>

<span class="hljs-meta">&lt;?php</span>
  <span class="hljs-comment">// Database connection settings</span>
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_SERVER'</span>, <span class="hljs-string">'localhost'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_USERNAME'</span>, <span class="hljs-string">'root'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_PASSWORD'</span>, <span class="hljs-string">'root'</span>);
  <span class="hljs-title function_ invoke__">define</span>(<span class="hljs-string">'DB_NAME'</span>, <span class="hljs-string">'dev'</span>);
  <span class="hljs-variable">$db_conn</span> = <span class="hljs-title function_ invoke__">mysqli_connect</span>(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

  <span class="hljs-comment">// Initialize message variable</span>
  <span class="hljs-variable">$message</span> = <span class="hljs-string">""</span>;

  <span class="hljs-comment">// Get form data(username and password)</span>
  <span class="hljs-variable">$username</span> = <span class="hljs-variable">$_POST</span>[<span class="hljs-string">'username'</span>];
  <span class="hljs-variable">$password</span> = <span class="hljs-variable">$_POST</span>[<span class="hljs-string">'password'</span>];

  <span class="hljs-comment">// Query the database for the username</span>
  <span class="hljs-variable">$sql</span> = <span class="hljs-string">"SELECT * FROM users WHERE username = '<span class="hljs-subst">$username</span>'"</span>;
  <span class="hljs-variable">$result</span> = <span class="hljs-title function_ invoke__">mysqli_query</span>(<span class="hljs-variable">$db_conn</span>, <span class="hljs-variable">$sql</span>);

  <span class="hljs-comment">// Check if the user exists</span>
  <span class="hljs-keyword">if</span> (<span class="hljs-title function_ invoke__">mysqli_num_rows</span>(<span class="hljs-variable">$result</span>) &gt; <span class="hljs-number">0</span>) {
    <span class="hljs-variable">$user</span> = <span class="hljs-title function_ invoke__">mysqli_fetch_array</span>(<span class="hljs-variable">$result</span>);

    <span class="hljs-comment">// Check if the password matches</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable">$user</span>[<span class="hljs-string">'password'</span>] === <span class="hljs-variable">$password</span>) {
      <span class="hljs-comment">// Login success message</span>
      <span class="hljs-variable">$message</span> = <span class="hljs-string">"&lt;p style='color: green;'&gt;Login Successful!&lt;/p&gt;"</span>;
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-comment">// Login failure due to incorrect password</span>
      <span class="hljs-variable">$message</span> = <span class="hljs-string">"&lt;p style='color: red;'&gt;Login Failed. Incorrect password.&lt;/p&gt;"</span>;
    }
  } <span class="hljs-keyword">else</span> {
    <span class="hljs-comment">// Login failure due to username not found</span>
    <span class="hljs-variable">$message</span> = <span class="hljs-string">"&lt;p style='color: red;'&gt;Login Failed. Username not found.&lt;/p&gt;"</span>;
  }
<span class="hljs-meta">?&gt;</span>

<span class="hljs-meta">&lt;!DOCTYPE <span class="hljs-keyword">html</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">html</span> <span class="hljs-attr">lang</span>=<span class="hljs-string">"ko"</span>&gt;</span>
  <span class="hljs-tag">&lt;<span class="hljs-name">head</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">charset</span>=<span class="hljs-string">"UTF-8"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">name</span>=<span class="hljs-string">"viewport"</span> <span class="hljs-attr">content</span>=<span class="hljs-string">"width=device-width, initial-scale=1.0"</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">title</span>&gt;</span>Login Result<span class="hljs-tag">&lt;/<span class="hljs-name">title</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">link</span> <span class="hljs-attr">rel</span>=<span class="hljs-string">"stylesheet"</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"style.css"</span>&gt;</span>
  <span class="hljs-tag">&lt;/<span class="hljs-name">head</span>&gt;</span>

  <span class="hljs-tag">&lt;<span class="hljs-name">body</span>&gt;</span>
    <span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">class</span>=<span class="hljs-string">"login-container"</span>&gt;</span>
      <span class="hljs-meta">&lt;?php</span> <span class="hljs-keyword">echo</span> <span class="hljs-meta">$message</span>; <span class="hljs-meta">?&gt;</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">button</span>&gt;</span>
      <span class="hljs-tag">&lt;<span class="hljs-name">a</span> <span class="hljs-attr">href</span>=<span class="hljs-string">"login.php"</span>&gt;</span>Back to Login Page<span class="hljs-tag">&lt;/<span class="hljs-name">a</span>&gt;</span>
      <span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span>
    <span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>
  <span class="hljs-tag">&lt;/<span class="hljs-name">body</span>&gt;</span>
<span class="hljs-tag">&lt;/<span class="hljs-name">html</span>&gt;</span>
</code></pre>

<br>

##### 4. 스타일 정의(style.css)

로그인 페이지와 회원 가입 페이지에 공통으로 적용되는 일관된 스타일을 정의한다.

<style>
  .hljs-selector-class, .hljs-selector-pseudo {
    color: #6f42c1;
  }

  .hljs-number {
    color: #d73a49;
  }
</style>

<pre><code class="language-css hljs" data-highlighted="yes"><span class="hljs-comment">/* style.css */</span>

<span class="hljs-selector-tag">body</span> {
  <span class="hljs-attribute">display</span>: flex;
  <span class="hljs-attribute">height</span>: <span class="hljs-number">100vh</span>;
  <span class="hljs-attribute">margin</span>: <span class="hljs-number">0</span>;
  <span class="hljs-attribute">background-color</span>: gray;
  <span class="hljs-attribute">font-family</span>: Arial, sans-serif;
  <span class="hljs-attribute">justify-content</span>: center;
  <span class="hljs-attribute">align-items</span>: center;
}

<span class="hljs-selector-class">.signup-container</span>,
<span class="hljs-selector-class">.login-container</span> {
  <span class="hljs-attribute">width</span>: <span class="hljs-number">300px</span>;
  <span class="hljs-attribute">padding</span>: <span class="hljs-number">30px</span>;
  <span class="hljs-attribute">border-radius</span>: <span class="hljs-number">8px</span>;
  <span class="hljs-attribute">background-color</span>: white;
  <span class="hljs-attribute">box-shadow</span>: <span class="hljs-number">0</span> <span class="hljs-number">4px</span> <span class="hljs-number">8px</span> <span class="hljs-built_in">rgba</span>(<span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0</span>, <span class="hljs-number">0.1</span>);
  <span class="hljs-attribute">text-align</span>: center;
}

<span class="hljs-selector-tag">input</span> {
  <span class="hljs-attribute">width</span>: <span class="hljs-number">100%</span>;
  <span class="hljs-attribute">margin</span>: <span class="hljs-number">10px</span> <span class="hljs-number">0</span>;
  <span class="hljs-attribute">padding</span>: <span class="hljs-number">10px</span>;
  <span class="hljs-attribute">border</span>: <span class="hljs-number">1px</span> solid gray;
  <span class="hljs-attribute">border-radius</span>: <span class="hljs-number">4px</span>;
  <span class="hljs-attribute">font-size</span>: <span class="hljs-number">14px</span>;
  <span class="hljs-attribute">box-sizing</span>: border-box;
}

<span class="hljs-selector-tag">button</span> {
  <span class="hljs-attribute">width</span>: <span class="hljs-number">100%</span>;
  <span class="hljs-attribute">margin</span>: <span class="hljs-number">20px</span> <span class="hljs-number">0</span>;
  <span class="hljs-attribute">padding</span>: <span class="hljs-number">10px</span>;
  <span class="hljs-attribute">border</span>: none;
  <span class="hljs-attribute">border-radius</span>: <span class="hljs-number">4px</span>;
  <span class="hljs-attribute">background-color</span>: <span class="hljs-number">#a78bfa</span>;
  <span class="hljs-attribute">color</span>: white;
  <span class="hljs-attribute">font-size</span>: <span class="hljs-number">16px</span>;
  <span class="hljs-attribute">cursor</span>: pointer;

  <span style="color: #22863a;">&amp;</span><span class="hljs-selector-pseudo">:hover</span> {
    <span class="hljs-attribute">background-color</span>: <span class="hljs-number">#8b5cf6</span>;
  }
}

<span class="hljs-selector-tag">a</span> {
  <span class="hljs-attribute">display</span>: block;
  <span class="hljs-attribute">color</span>: <span class="hljs-number">#a78bfa</span>;

  <span class="hljs-selector-tag">button</span> <span style="color: #22863a;">&amp;</span> {
    <span class="hljs-attribute">color</span>: white;
    <span class="hljs-attribute">text-decoration</span>: none;
  }
}
</code></pre>

<br>

##### 실행 결과

브라우저에서 `http://x.x.x.x/sign_up.php`로 접속하면 다음과 같은 회원 가입 페이지가 나타난다.  

![회원 가입 페이지](/data/Penetration%20Testing%20%7C%20Week%202/6.png)

필요한 정보를 입력하고 폼을 제출하면, `login.php?sign_up=success`로 리다이렉트되며 회원 가입 성공 알림 창이 뜬다.

![회원 가입 성공](/data/Penetration%20Testing%20%7C%20Week%202/7.png)

이때 `users` 테이블을 확인해 보면 다음과 같이 레코드가 추가되었음을 알 수 있다.

<img src="/data/Penetration%20Testing%20%7C%20Week%202/8.png" alt="users 테이블" style="padding: 0 12.5%; background-color: white">

`test` 사용자가 데이터베이스에 등록된 이후 다시 `test`라는 `username`으로 중복 회원 가입 시도를 하면 다음과 같은 알림 창이 표시된다.

![중복 회원 가입 시도](/data/Penetration%20Testing%20%7C%20Week%202/9.png)

회원 가입 성공 후 알림 창을 닫으면 다음과 같이 로그인 페이지로 이동한다.

![로그인 페이지](/data/Penetration%20Testing%20%7C%20Week%202/10.png)

`test`/`test`를 입력하여 로그인에 성공하면 로그인 성공 화면으로 이동한다.

![로그인 성공](/data/Penetration%20Testing%20%7C%20Week%202/11.png)

`test`/`tset`과 같이 잘못된 비밀번호를 입력하면 비밀번호 불일치로 인한 로그인 실패 메시지가 출력된다.

![로그인 실패](/data/Penetration%20Testing%20%7C%20Week%202/12.png)

현재 데이터베이스에 등록되지 않은 아이디를 통해 로그인을 시도하면 `username`이 존재하지 않는다는 메시지가 출력된다.

![로그인 실패](/data/Penetration%20Testing%20%7C%20Week%202/13.png)