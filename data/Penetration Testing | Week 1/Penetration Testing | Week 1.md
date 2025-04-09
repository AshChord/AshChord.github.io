### 강의 노트

##### 웹 서버

**웹 서버**란 웹 브라우저에서 요청한 파일을 전달해주는 프로그램을 말한다.

클라이언트가 웹 브라우저의 주소창에 입력하는 <b>URL(Uniform Resource Locator)</b>는 웹 서버에서 파일이 위치한 경로를 나타내며, 다음과 같은 형태로 구성되어 있다.

```bash
[Protocol]://[Domain or IP Address]:[Port]/[File Path]
ex) http://192.168.50.177:80/index.html
```

> **Well Known Port와 index 파일**  
>
> **Well Known Port**란 프로토콜마다 기본적으로 정해져 있는 포트 번호를 말한다. HTTP는 80, HTTPS는 443을 사용한다.  
> Well Known Port를 사용하는 경우 URL에서 포트 번호를 생략해도 무방하다.  
>
> **index 파일**이란 URL의 파일 경로가 비어 있는 경우, 웹 서버가 기본적으로 전송하는 파일을 말한다.  
> html 파일인 경우, 해당 파일은 index.html이다.  
>
> ex) https:\//www\.naver.com과 https:\//<span>www\.naver.com<span>:443/index.html은 같은 주소이다.

URL의 파일 경로의 기준은 **Web Root**, 웹 서버의 루트 디렉토리이며 일반적으로는 /var/www/html을 사용한다.  
즉, 위의 예시 경로에서 intex.html의 실제 위치는 **/var/www/html/index.html**이다.

Web Root보다 상위 디렉토리에 위치한 파일을 요청하면 어떻게 될까?  
브라우저에 http:\//192.168.50.177:80/../index.html과 같은 URL을 입력하면, 웹 서버는 해당 파일을 찾을 수 없다는 내용의 에러를 반환한다. 다시 말해 클라이언트는 Web Root 하위에 있는 파일에만 접근할 수 있다.
만약 Web Root보다 상위 디렉토리에 접근할 수 있다면, 웹 서버가 설치된 호스트의 모든 파일들이 노출될 수 있어 보안 체계가 취약해진다. Web Root가 /가 아닌 /var/www/html과 같은 특정 경로인 이유도 이 때문이다.


##### 동적 페이지

**동적 페이지**란 웹 서버에서 전송되는 고정된 콘텐츠의 웹 페이지(정적 페이지)가 아닌, 사용자와의 상호 작용이나 외부 데이터에 의해 동적으로 생성되는 웹 페이지를 말한다. 사용자가 입력한 데이터에 따라 다른 결과를 보여 주는 로그인 페이지가 대표적인 예시이다.

동적 페이지를 생성하는 과정은 <b>WAS(Web Application Server)</b>에서 담당한다.

> **Web Server - WAS - DB**
>
> ![Wep Application Architecture 구조](/data/Penetration%20Testing%7C%20Week%201/4.png)
> 웹 애플리케이션 아키텍쳐는 크게 **Web Server, Web Application Server, Database**로 구성된다.  
> **- Web Server**: 웹 브라우저의 요청을 받아 파일(정적 웹 페이지)을 전송  
> **- Web Application Server**: 동적 웹 페이지를 생성 및 처리  
> **- Database**: 웹 애플리케이션에서 필요한 데이터를 저장 및 관리

<br>

##### Get 방식과 Post 방식

다음과 같은 score.php 파일을 생각해 보자.

```php
# score.php

<html>
  <h1>Score</h1>
  <h2>Name: <?php echo $_GET['name']; ?></h2>
</html>
```

<?php ... ?> 태그 내의 PHP 코드는 **GET 방식**으로 name이라는 파라미터에 전달된 값을 출력하라는 의미이다.  
이 파일을 웹 브라우저에서 접근할 때는 http:\//example.com/score.php<b>?name=john</b>과 같은 URL을 이용한다.
URL에서 알 수 있듯이, **GET 방식**이란 클라이언트가 서버에 데이터를 URL에 포함시켜 전달하는 방식을 말한다. ? 뒤의 문자열을 쿼리 스트링이라고 부르며, [Parameter name]=[Data]의 형태로 구성된다.

> 쿼리 스트링의 파라미터가 여러 개일 경우, name=john&score=100과 같이 &로 구분한다.

웹 서버가 score.php를 요청받으면, 파일 내의 PHP 코드(동적 웹 페이지 생성 코드)를 확인하고 WAS에 처리를 위임한다. WAS는 PHP 코드를 실행한 결과를 다시 웹 서버로 반환하며 이때의 score.php는 다음과 같은 정적 파일로 바뀐다.

```php
# score.php

<html>
  <h1>Score</h1>
  <h2>Name: john></h2>
</html>
```

웹 서버는 최종적으로 위의 파일을 웹 브라우저로 전송하게 된다.

> **Front-End & Back-End**
>
> **- Front-End**: 클라이언트 측 코드, 즉 브라우저가 실행하는 코드(html, css, javascript...)  
> **- Back-End**: 서버 측 코드(PHP, ASP, JSP...)

<br>

GET 방식을 이용해 데이터를 전달할 때 반드시 URL에 직접 쿼리 스트링을 작성할 필요는 없다.  
아래의 name.php 파일을 보자.


```php
# name.php

<form method="GET">
  <input type="text" name="id"/>
</form>

<?php
  echo $_GET['id'];
?>
```

위 코드는 입력 폼에 데이터(id 파라미터)를 입력받아 GET 방식으로 전달한 후 출력하는 코드이다.  
http:\//192.164.64.8/name.php과 같은 URL로 접속하면, 다음과 같은 페이지가 보인다.

<div style="text-align: center"><img src="/data/Penetration%20Testing%7C%20Week%201/5.png" alt="GET 방식 - 1" width="600"/></div>

입력 폼에 john을 입력하고 엔터를 누르면 다음과 같은 일이 발생한다.

<div style="text-align: center"><img src="/data/Penetration%20Testing%7C%20Week%201/6.png" alt="GET 방식 - 2" width="600"/></div>

웹 브라우저가 http:\//192.164.64.8/name.php?id=john으로 이동하며 john이라는 문자열이 출력되었다.  
이와 같이, form 태그를 이용해 GET 방식으로 데이터를 전달할 수 있다.

그렇다면 **POST 방식**은 무엇일까? name.php를 다음과 같이 수정해 보자.

```php
# name.php

<form method="POST">
  <input type="text" name="id"/>
</form>

<?php
  echo $_POST['id'];
?>
```

http:\//192.164.64.8/name.php에 접속한 후 입력 폼에 john을 입력하면 다음과 같은 페이지를 볼 수 있다.

<div style="text-align: center"><img src="/data/Penetration%20Testing%7C%20Week%201/5.png" alt="POST 방식" width="600"/></div>

john이 정상적으로 출력되었으나, **URL에는 변화가 없음**을 알 수 있다. 이렇듯 POST 방식을 이용한 데이터 전달은 URL을 통해 이루어지지 않는다.

> **POST 방식**에서는 데이터가 **Request의 Body**에 포함되어 서버로 전송된다.


### 웹 개발 환경 구축

###### 1\. UTM 설치

[https://mac.getutm.app/](https://mac.getutm.app/)

![UTM 설치](/data/Penetration%20Testing%7C%20Week%201/1.png)

<br/>

###### 2\. Ubuntu 설치

[https://cdimage.ubuntu.com/noble/daily-live/current/](https://cdimage.ubuntu.com/noble/daily-live/current/)

![Ubuntu 설치](/data/Penetration%20Testing%7C%20Week%201/2.png)

<br/>

###### 3\. Ubuntu 세팅하기

[https://www.youtube.com/watch?v=JrNS3brSnmA](https://www.youtube.com/watch?v=JrNS3brSnmA)

<p><iframe width="800" height="450" src="https://www.youtube.com/embed/JrNS3brSnmA?si=X5BHQNvEJULEvTPM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></p>

<br/>

###### 4\. APM 설치

터미널에서 다음 명령어들을 순서대로 실행한다.

```bash
sudo apt install apache2
sudo apt install mysql-server
sudo apt install php php-mysql
```

<br/>

###### 5\. SSH 설정

VS Code를 줄곧 사용해온 관계로 Termius 대신 VS Code의 Remote - SSH 플러그인을 사용하였다.

![Remote - SSH](/data/Penetration%20Testing%7C%20Week%201/3.png)

해당 플러그인 설치 후 SSH Configuration 파일에 다음과 같이 작성하면 원격 접속이 가능해진다.

```bash
Host [Host 이름]
    Hostname [Host IP 주소]  
    Port [Port 번호]  
    User [User 이름]
```

ip 주소는 `ifconfig` 명령어를 통해 알 수 있다. 명령어가 설치되지 않은 경우 `sudo apt install net-tools`로 설치 가능하다.