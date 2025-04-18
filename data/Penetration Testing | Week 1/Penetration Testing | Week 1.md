### 강의 노트

#### 웹 서버

**웹 서버**란 웹 브라우저에서 요청한 파일을 전달해주는 프로그램을 의미한다.

클라이언트가 웹 브라우저의 주소창에 입력하는 <strong>URL(Uniform Resource Locator)</strong>은 웹 서버에서 파일이 위치한 경로를 나타내며, 다음과 같은 형태로 구성되어 있다.

```bash
[Protocol]://[Domain or IP Address]:[Port]/[File Path]
ex) http://192.168.50.177:80/index.html
```

> **Well Known Port와 index 파일**  
>
> **Well Known Port**란 프로토콜마다 기본적으로 정해져 있는 포트 번호를 말한다.
> HTTP는 80, HTTPS는 443을 사용한다.  
> Well Known Port를 사용하는 경우 URL에서 포트 번호를 생략해도 무방하다.  
>
> **index 파일**이란 URL의 파일 경로가 비어 있을 때, 웹 서버가 기본적으로 전송하는 파일을 말한다.  
> HTML 파일의 경우 index.html에 해당한다.  
>
> ex) **https\://www\.naver.com**과 **https\://www\.naver.com:443/index.html**은 같은 주소이다.

URL의 파일 경로는 **Web Root**라 불리는 웹 서버의 루트 디렉토리를 기준으로 하며, 일반적으로는 **/var/www/html**를 사용한다. 즉, 위 예시 경로에서 intex.html의 실제 위치는 **/var/www/html/index.html**이다.

Web Root보다 상위 디렉터리에 위치한 파일을 요청하면 어떻게 될까?  
예를 들어 브라우저에 http:\//192.168.50.177:80/../index.html과 같은 URL을 입력하면 웹 서버는 해당 파일을 찾을 수 없다는 오류를 반환한다. 이는 클라이언트가 Web Root 하위에 있는 파일에만 접근할 수 있도록 설계되어 있기 때문이다. 만약 Web Root보다 상위 디렉터리에 접근이 가능하다면, 웹 서버가 설치된 시스템의 모든 파일이 외부에 노출될 수 있어 보안상 매우 위험해진다. Web Root로 /가 아닌 /var/www/html과 같은 제한된 경로를 사용하는 이유도 이 때문이다.

<br>

#### 동적 페이지

**동적 페이지**란 웹 서버에서 전송되는 고정된 콘텐츠의 웹 페이지(정적 페이지)가 아닌, 사용자와의 상호 작용이나 외부 데이터에 의해 내용이 동적으로 생성되는 웹 페이지를 말한다. 사용자가 입력한 데이터에 따라 화면이 달라지는 로그인 페이지가 대표적이다.

이러한 동적 페이지는 <strong>WAS(Web Application Server)</strong>에서 생성과 처리를 담당한다.

> **Web Server - WAS - DB**
> ![Web Application Architecture 구조](/data/Penetration%20Testing%20%7C%20Week%201/4.png)
> 웹 애플리케이션 아키텍쳐는 크게 **Web Server, Web Application Server, Database**로 구성된다.  
> **- Web Server**: 웹 브라우저의 요청을 받아 파일(정적 웹 페이지)을 전송  
> **- Web Application Server**: 동적 웹 페이지를 생성 및 처리  
> **- Database**: 웹 애플리케이션에서 필요한 데이터를 저장 및 관리

<br>

#### Get 방식과 Post 방식

다음과 같은 score.php 파일을 생각해 보자.

```php
// score.php

<html>
  <h1>Score</h1>
  <h2>Name: <?php echo $_GET['name']; ?></h2>
</html>
```

위 코드에서 ```<?php ... ?>``` 태그 안의 PHP 코드는 **GET 방식**으로 name이라는 파라미터에 전달된 값을 출력하라는 의미이다.  
이 파일에 접근하려면 http\://[example-ip]/score.php<strong>?name=john</strong>과 같은 URL을 이용한다.
URL의 형태에서 알 수 있듯이, **GET 방식**은 클라이언트가 서버에 데이터를 전송할 때, URL에 데이터를 포함하는 방식을 말한다. ? 뒤의 문자열을 쿼리 스트링이라고 하며, [Parameter name]=[Data]의 형태로 구성된다.

> 쿼리 스트링의 파라미터가 여러 개인 경우, name=john&score=100과 같이 &로 구분한다.

웹 서버가 score.php를 요청받으면, 파일 내의 PHP 구문(동적 웹 페이지 생성 코드)를 확인하고 해당 처리를 WAS에 위임한다. WAS는 PHP 코드를 실행한 결과를 웹 서버에 반환하며, 이때의 score.php는 다음과 같은 정적인 HTML로 바뀐다.

```php
// score.php

<html>
  <h1>Score</h1>
  <h2>Name: john></h2>
</html>
```

웹 서버는 최종적으로 정적인 결과물을 웹 브라우저로 전송하게 된다.

> **Front-End & Back-End**
>
> **- Front-End**: 브라우저에서 실행되는 클라이언트 측 코드(HTML, CSS, JavaScript...)  
> **- Back-End**: 서버에서 실행되는 코드(PHP, ASP, JSP...)

GET 방식으로 데이터를 전달할 때 반드시 URL에 직접 쿼리 스트링을 작성할 필요는 없다.  
아래의 name.php 파일을 보자.

```php
// name.php

<form method="GET">
  <input type="text" name="id"/>
</form>

<?php
  echo $_GET['id'];
?>
```

위 코드는 입력 폼을 통해 데이터(id 파라미터)를 GET 방식으로 전달받고 출력하는 기능을 한다.  
http\://[example-ip]/name.php과 같은 URL로 접속하면 입력 폼이 표시된다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/5.png" alt="GET 방식(1)" width="600"/>

입력 폼에 john을 입력하고 전송하면, 브라우저는 http\://[example-ip]/name.php?id=john으로 이동하며 전달된 값이 페이지에 출력된다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/6.png" alt="GET 방식(2)" width="600"/>

이와 같이, form 태그를 이용해 GET 방식으로 데이터를 전달할 수 있다.

그렇다면 **POST 방식**은 무엇일까? name.php를 다음과 같이 수정해 보자.

```php
// name.php

<form method="POST">
  <input type="text" name="id"/>
</form>

<?php
  echo $_POST['id'];
?>
```

http\://[example-ip]/name.php에 접속하여 입력 폼에 john을 입력하고 전송하면 다음과 같은 결과를 확인할 수 있다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/7.png" alt="POST 방식" width="600"/>

john이 정상적으로 출력되었으나, **URL에는 변화가 없음**을 알 수 있다.  
POST 방식을 이용한 데이터 전달은 URL을 통해 이루어지지 않는다.

> **POST 방식**에서는 데이터가 **HTTP Request의 Body**에 포함되어 서버로 전송된다.

<br>

### 과제

#### 웹 개발 환경 구축

##### 1\. UTM 설치

Mac에서 가상 머신을 구동하기 위해 UTM을 설치한다.  
[https://mac.getutm.app/](https://mac.getutm.app/)

![UTM 설치](/data/Penetration%20Testing%20%7C%20Week%201/1.png)

<br>

##### 2\. Ubuntu 설치

다음 링크에서 Ubuntu ISO 이미지를 다운로드한다.  
[https://cdimage.ubuntu.com/noble/daily-live/current/](https://cdimage.ubuntu.com/noble/daily-live/current/)

![Ubuntu 설치](/data/Penetration%20Testing%20%7C%20Week%201/2.png)

<br>

##### 3\. Ubuntu 세팅

Ubuntu 설치 및 초기 세팅은 아래 영상의 가이드를 참고한다.  
[https://www.youtube.com/watch?v=JrNS3brSnmA](https://www.youtube.com/watch?v=JrNS3brSnmA)

<p style="margin: 32px 0; padding-top: 56.25%; position: relative;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" width="800" height="450" src="https://www.youtube.com/embed/JrNS3brSnmA?si=X5BHQNvEJULEvTPM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

<br>

##### 4\. APM 설치

웹 개발 환경을 구축하려면 **Apache, PHP, MySQL**을 설치해야 한다. 이 세 가지 소프트웨어는 APM 스택을 이루며, Linux에서 사용하는 경우 LAMP라고 부르기도 한다. 각각의 역할은 다음과 같다.

- **Apache(웹 서버)**: Apache는 HTTP 요청을 받아서 웹 페이지나 파일을 클라이언트에게 전달하는 역할을 한다. 웹 서버로서 가장 널리 사용되는 소프트웨어 중 하나이다.
- **PHP(서버 측 스크립트 언어)**: PHP는 서버 측에서 동적으로 웹 페이지를 생성하는 데 사용되는 스크립트 언어이다. MySQL과 결합하여 동적인 콘텐츠를 생성하고 데이터를 처리한다.
- **MySQL(데이터베이스 서버)**: MySQL은 데이터를 저장하고 관리하는 데이터베이스 서버로, 웹 애플리케이션에서 필요한 정보를 저장하는 데 사용된다.

터미널에서 다음 명령어들을 실행하여 각 컴포넌트를 설치할 수 있다.

```bash
sudo apt install apache2          # Apache 웹 서버 설치
sudo apt install php php-mysql    # PHP 및 MySQL 연동 모듈 설치
sudo apt install mysql-server     # MySQL 데이터베이스 설치
```

<br>

##### 5\. SSH 설정

VS Code를 주로 사용해온 관계로 Termius 대신 Remote - SSH 플러그인을 이용해 원격 접속을 구성하였다.

![Remote - SSH](/data/Penetration%20Testing%20%7C%20Week%201/3.png)

해당 플러그인 설치 후 SSH 설정 파일에 다음과 같이 작성하면 원격 접속이 가능해진다.

```bash
Host [Host 이름]
    Hostname [Host IP 주소]  
    Port [Port 번호]  
    User [User 이름]
```

IP 주소는 `ifconfig` 명령어를 통해 알 수 있다. 명령어가 설치되지 않은 경우 다음 명령어로 `net-tools` 패키지를 설치한다.

```bash
sudo apt install net-tools
```

<br>

#### 로그인 페이지 제작

Apache 웹 서버의 루트 디렉토리인 /var/www/html 경로에 로그인 기능을 구현하기 위한 세 개의 파일을 생성하였다.

- **`login.php`**: 로그인 입력 폼을 담당하는 파일
- **`login_proc.php`**: 로그인 정보를 처리하는 서버 측 코드
- **`style.css`**: 로그인 페이지의 스타일을 정의한 CSS 파일

<br>

**1\. 로그인 입력 폼(login.php)**

`login.php` 파일은 사용자로부터 아이디와 비밀번호를 입력받는 간단한 HTML 폼으로 구성되어 있다.  
폼은 POST 방식으로 `login_proc.php`로 데이터를 전송한다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/8.png" alt="login.php" width="500"/>

**2\. 로그인 처리(login_proc.php)**

`login_proc.php`에서는 전달받은 아이디와 비밀번호를 확인하여 로그인 성공 여부를 판단한다.  
예시에서는 간단한 하드코딩 방식으로 처리하였다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/9.png" alt="login_proc.php" width="500"/>

**3\. 스타일 정의(style.css)**

로그인 폼의 레이아웃과 색상, 버튼 스타일 등은 style.css를 통해 지정하였다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/10.png" alt="style.css" width="500"/>

실행 결과는 다음과 같다.

<br>

**로그인 페이지**

브라우저에서 http://[example-ip]/login.php로 접속하면 다음과 같은 로그인 페이지가 나타난다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/11.png" alt="로그인 페이지" width="600"/>

**로그인 성공**

올바른 아이디와 비밀번호를 입력하면 로그인 성공 화면으로 이동한다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/12.png" alt="로그인 성공" width="600"/>

**로그인 실패**

잘못된 정보를 입력하면 로그인 실패 메시지가 출력된다.

<img src="/data/Penetration%20Testing%20%7C%20Week%201/13.png" alt="로그인 실패" width="600"/>