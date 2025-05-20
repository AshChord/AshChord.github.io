### 강의 노트

#### 로그인 페이지 구조

1주차 과제로 PHP를 활용해 간단한 로그인 페이지를 제작했다.  
이번에는 실제 서비스 구조에 조금 더 가까운 흐름을 설계해 보자.

- 메인 페이지는 `index.php`이다.
- 사용자가 로그인하지 않은 상태로 접근하면 자동으로 `login.php`로 리다이렉션된다.
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

위 코드에서는 `login_id` 파라미터의 존재 여부를 확인한다. 해당 값이 비어 있다면 로그인되지 않은 상태로 판단하고, `login.php`로 리다이렉션한다.
- `header()` 함수는 HTTP 응답 헤더에 `Location: login.php`를 추가하여 사용자가 `login.php` 페이지로 이동하도록 하는 역할을 수행한다.
- `exit`은 스크립트 실행을 종료하는 명령어로, 리다이렉션 후 `header()` 뒤의 코드가 불필요하게 노출되거나 실행되는 것을 방지하기 위해 사용한다.

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

사용자가 로그인 폼을 제출하면, `UserId`와 `Password` 값을 받아 `login()` 함수가 호출된다. 그 결과가 참이면 로그인 성공으로 간주하고, 사용자의 로그인 정보를 쿼리 스트링 형식(GET 방식)으로 `login_id`에 담아 `index.php`로 리다이렉션한다. 로그인 실패 시에는 "로그인 실패" 메시지를 출력한다.

<br>

#### 데이터베이스

**데이터베이스**란 웹 애플리케이션에서 필요한 데이터를 저장 및 관리하는 시스템을 말한다. 구조적으로 우리가 흔히 사용하는 엑셀 프로그램과 유사한 점이 있는데, 데이터베이스의 주요 개념은 엑셀의 구성 요소와 다음과 같이 비교할 수 있다.

| 데이터베이스 주요 개념 | 엑셀 구성 요소 | 설명 |
|------------------|-------------|-----|
| 데이터베이스<br>(Broadly) | 엑셀 프로그램 전체 | 데이터를 저장·관리하는 전체 시스템 혹은 기술 영역 |
| 데이터베이스<br>(Narrowly) | 엑셀 파일 | 데이터가 저장되는 구조적 공간 |
| 테이블 | 엑셀 시트 | 행과 열로 이루어진 데이터 집합 |
| 레코드 | 엑셀 시트의 한 행(Row) | 하나의 데이터 항목(한 사람, 한 거래 등) |
| 필드 | 엑셀 시트의 한 열(Column) | 데이터의 속성(이름, 나이 이메일 등) |

<br>

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

**SELECT**: 데이터 조회 명령어

```sql
/* Syntax */
SELECT [column_1], [column_2], ... FROM [table_name];


/* Example */
SELECT * FROM stock_list;
SELECT market FROM stock_list;
SELECT stock_symbol, company_name FROM stock_list;
```

SELECT 명령어는 위와 같이 사용 가능하다. `*`는 모든 컬럼을 의미한다.  
예를 들어, `SELECT stock_symbol, company_name FROM stock_list;`를 실행하면 다음과 같은 결과를 얻을 수 있다.

| stock_symbol | company_name     |
|--------------|------------------|
| AAPL         | Apple            |
| TSLA         | Tesla            |
| MSFT         | Microsoft        |
| JPM          | JPMorgan Chase   |
| NVDA         | NVIDIA           |

**INSERT**: 데이터 삽입 명령어

```sql
/* Syntax */
INSERT INTO [table_name] ([column_1], [column_2], ...)
VALUES ([value_1], [value_2], ...);


/* Example */
INSERT INTO stock_list (stock_symbol, market) VALUES ('WMT', 'NYSE');
INSERT INTO stock_list VALUES (6, 'ORCL', 'Oracle', 'NYSE'); -- 컬럼명 생략 가능
```

INSERT 명령어는 위와 같이 사용 가능하다.  
예를 들어, `INSERT INTO stock_list VALUES (6, 'ORCL', 'Oracle', 'NYSE');`를 실행하면 다음과 같은 결과를 얻을 수 있다.

| company_id | stock_symbol | company_name     | market |
|------------|--------------|------------------|--------|
| 1          | AAPL         | Apple            | NASDAQ |
| 2          | TSLA         | Tesla            | NASDAQ |
| 3          | MSFT         | Microsoft        | NASDAQ |
| 4          | JPM          | JPMorgan Chase   | NYSE   |
| 5          | NVDA         | NVIDIA           | NASDAQ |
| 6          | ORCL         | Oracle           | NYSE   |

**WHERE**: 조건 지정 명령어

```sql
/* Syntax */
SELECT [column_1], [column_2], ... FROM [table_name] WHERE [conditions];


/* Example */
SELECT company_name FROM stock_list WHERE company_id = 3;
SELECT * FROM stock_list WHERE market = 'NASDAQ';
SELECT * FROM stock_list WHERE market = 'NASDAQ' AND stock_symbol = 'AAPL';
```

WHERE 명령어는 위와 같이 사용 가능하다.  
예를 들어, `SELECT * FROM stock_list WHERE market = 'NASDAQ' AND stock_symbol = 'AAPL';`를 실행하면 다음과 같은 결과를 얻을 수 있다.

| company_id | stock_symbol | company_name     | market |
|------------|--------------|------------------|--------|
| 1          | AAPL         | Apple            | NASDAQ |

<br>

#### PHP - MySQL 연동

MySQL을 통해 dev 데이터베이스를 생성한 후, 다음과 같은 score 테이블을 추가하였다.

| id | name     | score |
|----|----------|-------|
| 1  | AshChord | 100   |

PHP 코드에서 위 테이블의 데이터를 사용하려면 어떻게 해야 할까?  
아래의 `db_test.php` 코드를 보자.

```php
// db_test.php

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
`mysqli_connect()` 함수에 위에서 정의한 상수들을 인자로 넘겨 데이터베이스 서버에 연결을 시도한다.  
연결 성공 시 `$db_conn` 변수에 연결 객체(데이터베이스와의 연결을 다루는 리소스)가 저장되며, 실패 시 `false`가 저장된다.

**3\. 연결 결과 출력:**  
`$db_conn`이 유효한지 확인해 연결 성공/실패 메시지를 출력한다.

**4\. 쿼리 작성 및 실행:**  
`SELECT * FROM score` 쿼리를 문자열로 작성하여 `$sql`에 저장한다.  
`mysqli_query()` 함수를 이용해 쿼리를 실행하고, 그 결과를 `$result`에 저장한다.

**5\. 결과 처리:**  
`mysqli_fetch_array()`를 통해 `$result`에서 첫 번째 행을 가져와 `$row` 변수에 배열 형태로 저장한다.  
`var_dump()` 함수로 배열 구조를 출력할 수 있으며, 특정 필드의 값만 가져오려면 `$row['name']`과 같이 사용할 수 있다.

`db_test.php` 파일의 실행 결과는 다음과 같다.

<img src="/data/Penetration%20Testing%20%7C%20Week%202/1.png" alt="db_test.php" width="600">

<br>
<br>

### 과제

#### phpMyAdmin

**phpMyAdmin**은 웹 브라우저를 통해 데이터베이스를 관리할 수 있는 GUI 기반 도구이다.  
CLI보다 접근성이 좋고 직관적이기 때문에 설치해두면 매우 유용하다.

phpMyAdmin은 다음 절차를 통해 사용할 수 있다.

##### 1\. phpMyAdmin 설치

터미널에서 다음 명령어를 실행한다.

```bash
sudo apt install phpmyadmin
```

##### 2\. 심볼릭 링크 설정

phpMyAdmin의 기본 경로는 /usr/share/phpmyadmin이다. 이를 Apache의 웹 서버 디렉토리인 /var/www/html에 심볼릭 링크로 연결하여 웹 브라우저에서 phpMyAdmin에 접근할 수 있도록 한다.

```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

> **심볼릭 링크(Symbolic Link)**
>
> 특정 파일이나 디렉터리에 대한 참조를 포함하는 특별한 파일로, Windows의 바로가기와 비슷한 개념이다.

##### 3\. Apache 웹 서버 재시작

심볼릭 링크를 생성한 후 Apache 웹 서버를 재시작한다.

```bash
sudo systemctl restart apache2
```

이제 웹 브라우저에서 http://[example-ip]/phpmyadmin을 입력하여 phpMyAdmin에 접속할 수 있다.  

![phpMyAdmin](/data/Penetration%20Testing%20%7C%20Week%202/2.png)

<br>

#### 점수 조회 페이지

위의 score 테이블을 사용하여, GET 방식으로 이름을 전달받아 점수를 출력하는 코드를 만들어 보자.  
`db_test.php`를 약간 수정하여 해당 기능을 구현할 수 있다.

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

사용자가 이름을 입력하고 제출하면, 해당 이름과 일치하는 데이터를 데이터베이스에서 찾아 점수를 출력한다.
`get_score.php`의 실행 결과는 아래와 같다.

<img src="/data/Penetration%20Testing%20%7C%20Week%202/3.png" alt="get_score.php(1)" width="600">
<img src="/data/Penetration%20Testing%20%7C%20Week%202/4.png" alt="get_score.php(2)" width="600">

<br>

#### 회원 가입 페이지

phpMyAdmin을 통해 dev 데이터베이스에 다음과 같은 users 테이블을 추가하였다.

![users](/data/Penetration%20Testing%20%7C%20Week%202/5.png)

회원 가입 페이지는 사용자로부터 정보를 입력받아 users 테이블에 저장하게 된다.  
1주차에 제작했던 로그인 페이지 역시 데이터베이스와 연동시켜 보자.

파일 구성은 다음과 같다.

- **`sign_up.php`**: 회원 가입 폼을 담당하는 파일
- **`login.php`**: 로그인 입력 폼을 담당하는 파일
- **`login_proc.php`**: 로그인 정보를 처리하는 서버 측 코드
- **`style.css`**: 전체 스타일을 정의한 CSS 파일

<br>

**1\. 회원 가입 폼(sign_up.php)**

사용자 이름, 이메일, 아이디, 비밀번호를 입력받아 dev 데이터베이스의 users 테이블에 저장하는 폼으로 구성되어 있다.  
이미 계정이 존재하는 사용자를 위해 로그인 페이지로 이동할 수 있는 링크가 포함되어 있다.    
회원 가입 시 `username`이 중복될 경우 경고 메시지를 출력한다.  
회원 가입이 완료되면 `login.php?signup=success`로 이동한다.

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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Sign Up</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- Container that holds the sign up form -->
    <div class="signup-container">
      <h1>Sign Up</h1>

      <!-- Sign up form -->
      <form method="POST">
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />

        <button type="submit">Sign Up</button>
      </form>

      <!-- Link to login page for users who already have an account -->
      <a href="login.php">Already have an account? Login here</a>
    </div>
  </body>
</html>
```

**2\. 로그인 입력 폼(login.php)**

회원 가입 완료 후 URL에 `signup=success` 쿼리 스트링이 포함된 경우, 알림창을 통해 회원 가입 성공 메시지를 띄운다.  
계정이 없는 사용자를 위해 회원 가입 페이지로 이동할 수 있는 링크가 포함되어 있다.

```php
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

        <!-- Link to sign up page for new users -->
        <a href="sign_up.php">Don't have an account? Sign up here</a>
        
      </form>
    </div>

    <!-- JavaScipt to show alert if sign up completed -->
    <script>
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('sign_up') === 'success') {
        alert('Sign up completed successfully!');
      }
    </script>
  </body>
</html>
```

**3\. 로그인 처리(login_proc.php)**

`login.php`로부터 전달받은 아이디와 비밀번호를 데이터베이스에 저장된 정보와 비교하여 로그인 여부를 판별한다.  
로그인 성공 시에는 성공 메시지를, 실패 시에는 실패 원인에 따라 다른 메시지를 출력한다.

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
    $message = "<p style='color: red;'>Login Failed. Username not found.</p>";
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

**4\. 스타일 정의(style.css)**

로그인 페이지와 회원 가입 페이지에 공통으로 적용되는 일관된 스타일을 정의한다.

```css
/* style.css */

body {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: gray;
}

.signup-container,
.login-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  text-align: center;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid gray;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  margin: 20px 0;
  background-color: #a78bfa;
  color: white;
  border: none;
  border-radius: 4px;
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

실행 결과는 다음과 같다.

<br>

**회원 가입 페이지**

브라우저에서 http://[example-ip]/sign_up.php로 접속하면 다음과 같은 회원 가입 페이지가 나타난다.  

![회원 가입 페이지](/data/Penetration%20Testing%20%7C%20Week%202/6.png)

필요한 정보를 입력하고 폼을 제출하면, `login.php?sign_up=success`로 리다이렉션되며 회원 가입 성공 알림 창이 뜬다.

![회원 가입 성공](/data/Penetration%20Testing%20%7C%20Week%202/7.png)

이때 users 테이블을 확인해 보면 다음과 같이 레코드가 추가되었음을 알 수 있다.

<img src="/data/Penetration%20Testing%20%7C%20Week%202/8.png" alt="레코드 추가" width="600">

admin이라는 사용자가 데이터베이스에 등록된 이후 재차 admin이라는 username으로 중복 회원 가입 시도를 하면 다음과 같은 알림 창이 뜬다.

![중복 회원 가입 시도](/data/Penetration%20Testing%20%7C%20Week%202/9.png)

**로그인 페이지**

![로그인 페이지](/data/Penetration%20Testing%20%7C%20Week%202/10.png)

admin/admin1234를 입력하여 로그인에 성공하면 로그인 성공 화면으로 이동한다.

![로그인 성공](/data/Penetration%20Testing%20%7C%20Week%202/11.png)

admin/admin123과 같이 잘못된 비밀번호를 입력하면 비밀번호 불일치로 인한 로그인 실패 메시지가 출력된다.

![로그인 실패(1)](/data/Penetration%20Testing%20%7C%20Week%202/12.png)

현재 데이터베이스에 등록되지 않은 아이디를 통해 로그인을 시도하면 username이 존재하지 않는다는 메시지가 출력된다.

![로그인 실패(2)](/data/Penetration%20Testing%20%7C%20Week%202/13.png)