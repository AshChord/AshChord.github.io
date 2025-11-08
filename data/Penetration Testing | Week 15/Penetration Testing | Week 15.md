--- meta
title: Penetration Testing | Week 15
date: 2025/07/20
excerpt: 파일 포함 취약점 및 파일 다운로드 취약점
categories: 모의 해킹
---

### 강의 노트

전주 복습: was에서 php 파일 실행하니까 파일 업로드 공격 하는것이고, 방어 기법 중 파일 이름을 랜덤문자열로 바꿔버리는것도 있음. 이런 건 뭐 sqli같은 거 연계해서 파일이름 찾아내는 방법등으로 우회.

#### 기타 파일 업로드 공격 기법(확장자 필터링 우회)

##### 이중 확장자

<strong>이중 확장자(Double Extension)</strong>란 파일명에 두 개 이상의 확장자가 연속으로 포함된 형식을 의미하며, 실제 파일 형식은 최종 확장자에 의해 결정된다. 선행 확장자는 사용자의 오인을 유도하거나 파일의 성격을 위장하기 위한 목적으로 활용되며, 주로 악성 실행 파일을 일반 문서나 이미지 등으로 가장하는 데 사용된다.

웹 애플리케이션 상의 파일 업로드 기능이 확장자 기반의 필터링 로직을 적용하고 있을 경우, 해당 로직의 구현 방식에 따라 이중 확장자를 이용한 우회가 가능할 수 있다. 예를 들어, 업로드한 파일명을 `.`를 기준으로 분할한 뒤 첫 번째 구분자 이후의 문자열을 확장자로 간주하는 경우, 실제 최종 확장자가 아닌 선행 확장자만을 검사하게 되어 우회가 발생한다. 다음의 예시 코드를 보자.

```php
<?php
$allowed = ['jpg', 'png'];
$filename = $_GET['filename'];

// explode(): 구분자를 기준으로 문자열을 잘라 배열로 반환하는 함수
$ext = explode('.', $filename)[1];

// strtolower(): 문자열을 모두 소문자로 변환하는 함수
if (!in_array(strtolower($ext), $allowed)) {
  echo "This file type is not allowed.";
  exit;
}

// 파일 업로드 처리
...
?>
```

업로드한 파일명이 `webshell.png.php`라고 가정하면, 위의 `$ext` 변수에 저장되는 값은 `php`가 아닌 `png`가 되어 확장자 필터링을 우회하게 된다. 결과적으로, 허용되지 않는 `.php` 확장자를 가진 실행 파일이 서버에 정상적으로 업로드되는 것이다.

이중 확장자를 활용한 또 다른 공격 기법으로 **Null Byte Injection**이 존재한다.

> **Null Byte Injection**
>
> <strong>널 바이트(Null Byte)</strong>란 ASCII 코드 값이 0인 제어 문자(`\0`)로, 주로 C 언어 계열에서 문자열의 종료를 나타내기 위해 사용된다. 이러한 널 바이트 문자를 문자열 입력 값에 삽입하여 문자열 처리 로직을 우회하거나 조작하는 공격 기법을 <strong>널 바이트 인젝션(Null Byte Injection)</strong>이라고 한다.

다음의 예시 코드를 살펴 보자.

```php
<?php
// 확장자 기반 필터링
...

$upload_dir = 'uploads/';
$filename = $_FILES['file']['name'];
$target = $upload_dir . $filename;

//move_uploaded_file(): 서버에 업로드된 임시 파일을 지정된 새 위치로 이동시키는 함수
if (move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
    echo "Upload successful!";
} else {
    echo "Upload failed.";
}
?>
```

공격자는 파일 업로드 시 `webshell.php%00.png`와 같은 파일명을 사용할 수 있는데, `%00`는 URL 인코딩 방식으로 표현된 널 바이트를 의미한다. 웹 애플리케이션의 필터링 로직은 파일의 최종 확장자가 `.png`이므로 해당 파일을 정상적인 이미지로 인식하여 업로드를 허용한다. 그러나 서버 측에서 해당 파일을 저장하는 과정(`move_uploaded_file()`)에서, 내부적으로 C 언어의 표준 라이브러리 함수(`fopen()` 등)를 호출하는 특성으로 인해 파일명에 포함된 널 바이트가 문자열의 종료 지점으로 인식된다. 이로 인해 파일명이 `webshell.php`로 잘리게 되어, 결과적으로 실행 가능한 PHP 파일로서 서버에 저장되는 상황이 발생한다.

> 현행 PHP 버전(PHP 5.3.4 이후)에서는 파일 처리 시 파일명에 널 바이트가 포함된 경우, 해당 작업을 거부하거나 오류를 반환하도록 보안 패치가 이루어졌다.

<br>

##### 웹 서버 설정 파일 업로드

웹 서버는 디렉터리 단위로 개별적인 설정을 적용하고 제어할 수 있는 구성 파일을 지원하며, 대표적으로 Apache 웹 서버에서는 `.htaccess` 파일이 이에 해당한다. 해당 파일은 URL 재작성, 리다이렉션 설정, 접근 제어 등 다양한 기능을 수행할 수 있으며, 그 중에는 MIME 타입 지정 기능도 포함되어 있다. 다음 예시를 보자.

```text
AddType application/x-httpd-php .png
```

위의 명령어는 `.png` 확장자를 가진 파일이 PHP 코드로 해석되도록 MIME 타입을 지정하는 설정이다. 공격자는 파일 업로드 시 파일명을 `.htaccess`로 지정한 후 해당 내용을 포함하여 서버에 업로드할 수 있다. 이후에는 PHP 코드가 포함된 `.png` 파일을 업로드하는 것만으로 확장자 필터링을 우회하여 임의 스크립트를 실행시킬 수 있다. 따라서 이러한 설정 파일의 업로드를 제한하지 않거나 적절한 검증 절차를 수행하지 않을 경우, 보안 대책이 무력화될 위험이 있으므로 각별한 주의가 필요하다.

---

#### 웹 셸의 한계점 및 리버스 셸

웹 셸은 원격에서 웹 서버에 명령을 실행할 수 있는 도구로, 공격자가 서버 내부를 탐색하거나 제어하는 데 활용된다. 그러나 웹 셸은 HTTP 프로토콜의 특성상 무상태(stateless) 환경에서 동작하기 때문에 분명한 한계점이 존재한다.

예를 들어, 웹 셸을 통해 `cd /` 명령을 실행하여 루트 디렉터리로 이동한 후 다시 `pwd` 명령을 입력하면, 기대와 달리 현재 디렉터리가 최초 접속 디렉터리(웹 셸 파일이 위치한 디렉터리)로 표시된다. 이는 HTTP 요청과 응답이 독립적으로 처리되어 각 요청 간에 상태 정보가 유지되지 않기 때문이다. 즉, 한 번의 명령 실행 후 상태가 초기화되어 이전에 변경된 작업 디렉터리 정보가 다음 요청에 반영되지 않는다.

이러한 이유로 웹 셸은 지속적인 세션 상태를 유지하거나 복잡한 상호작용이 필요한 상황에서 한계를 드러낸다. 따라서 공격자는 주로 <strong>리버스 셸(Reverse Shell)</strong> 방식을 활용하는데, 이는 피해 서버가 먼저 공격자 시스템으로 직접 연결을 생성하는 기법을 말한다. 보통 웹 셸을 통해 피해 서버 내에서 리버스 셸 연결을 위한 명령을 실행하며, 이 연결을 통해 양방향 데이터 교환과 명령 실행이 가능해진다. 또한, 리버스 셸은 일반적인 인바운드(외부 → 내부) 연결과 달리 서버 측에서 아웃바운드(내부 → 외부) 방식으로 연결을 시도하기 때문에 네트워크 방화벽 등의 보안 장치를 우회할 수 있다는 장점이 있다.

---

#### 파일 포함 취약점

PHP에서는 `include()`, `include_once()`, `require()` 등의 함수를 사용하여 외부 파일을 현재 실행 중인 코드에 포함시킬 수 있다. 이러한 함수들은 해당 파일의 내용을 그대로 현재 위치에 삽입하는 방식으로 동작한다. 이러한 파일 포함 함수의 특성을 활용하면 <strong>파일 포함 공격(File Inclusion Attack)</strong>을 수행할 수 있다.

웹 애플리케이션에서 특정 파라미터 값에 따라 다른 페이지를 로드하는 구조가 있다고 가정해 보자. 예를 들어, `lang=ko.php`, `lang=en.php`와 같이 요청 시 언어별 파일을 포함하는 형태를 고려할 수 있다. 만약 `lang` 파라미터에 `../../login.php`와 같은 상위 경로를 입력하면 어떻게 될까? 이 경우, 애플리케이션은 해당 경로의 파일을 그대로 포함하게 되고, 결국 로그인 페이지의 내용이 출력될 수 있다. 더 나아가, `../../../etc/passwd`와 같은 시스템 경로를 입력하면, 서버에 존재하는 민감한 파일(Linux 시스템의 패스워드 정보 등)을 노출시킬 가능성도 존재한다.

결론적으로 파일 포함 기능을 통해 서버 내에 존재하는 임의의 파일을 공격자가 직접 불러올 수 있는 상황이 발생하며, 이를 <strong>파일 포함 취약점(File Inclusion Vulnerability)</strong>이라고 한다. 이 중에서도 외부 서버가 아닌 로컬 파일을 대상으로 하는 경우는 <strong>LFI(Local File Inclusion)</strong> 취약점이라고 하며, 반대로 외부 서버의 파일을 포함하는 경우는 <strong>RFI(Remote File Inclusion)</strong> 취약점으로 분류된다.

공격자의 입장에서 가장 주요한 목표 중 하나는 웹 서버의 주요 소스 코드를 확보하는 것이다. 하지만 일반적인 파일 포함 방식으로는 소스 코드를 그대로 가져올 수 없다. 그 이유는 웹 서버가 PHP 파일의 내용이 아닌, 이를 실행한 결과만을 클라이언트에게 전달하기 때문이다.

하지만 이러한 웹 서버의 특성은 다른 방식으로 활용될 수 있다. 만약 웹 애플리케이션이 파일 업로드 기능을 제공하며, 사용자가 `.png` 파일을 업로드할 수 있다고 가정해 보자. 업로드된 파일은 서버에 저장되며, 외부에서 접근은 가능하지만 단순 이미지 파일이므로 실행되지는 않는다. 따라서 `.png` 확장자를 가진 파일에 PHP 코드를 삽입하더라도, 웹 서버는 이를 실행하지 않고 이미지로만 처리한다. 그러나 다른 페이지에 `include()` 등을 사용하여 해당 파일을 포함하는 코드가 존재한다면 상황이 달라진다. 왜냐하면 `include()`는 파일 확장자를 기준으로 동작하지 않고, 파일의 내용을 그대로 현재 위치에 삽입하여 처리하기 때문이다. 이 경우 `.png` 파일 내에 PHP 코드가 존재한다면 해당 코드가 그대로 포함되고, 결국 PHP 엔진에 의해 실행될 수 있게 된다.

즉, 파일 업로드 기능과 LFI 취약점이 결합되면, 공격자는 `.png` 확장자를 가진 파일에 악성 PHP 코드를 삽입하고 이를 포함시킴으로써 우회적으로 웹 셸을 획득할 수 있다. 이 방식은 일반적인 파일 업로드 취약점의 보안 조치를 우회하는 기법으로, 실제 공격 시도에서 매우 빈번하게 활용된다.

<br>

##### 파일 업로드 기능이 없는 경우

LFI 취약점이 존재하더라도 웹 애플리케이션에 파일 업로드 기능이 없는 경우 웹 셸을 획득할 수 없다고 생각하기 쉽다. 하지만 여전히 웹 셸을 실행할 수 있는 우회 방안이 존재하는데, 바로 웹 서버의 로그 파일을 이용하는 기법이다.

웹 서버는 모든 클라이언트 요청을 로그 파일에 기록한다. 일반적으로 Apache의 경우 `access_log`, `error_log`와 같은 로그 파일을 통해 클라이언트의 요청 경로, 파라미터 등 다양한 정보를 저장한다. 이러한 로그 파일은 서버의 내부 파일 시스템에 존재하며, 경로를 알고 있는 경우 LFI 취약점을 통해 포함시킬 수 있다.

이러한 특성을 악용하면 다음과 같은 공격이 가능해진다.

1\. 웹 요청을 보낼 때, URL 등 로그에 기록되는 위치에 `<?php system($_GET['cmd']); ?>`와 같은 악성 코드를 삽입한다.  
2\. 삽입된 웹 셸 코드는 실제로 존재하지 않는 경로이므로, 서버는 일반적으로 404 오류를 반환한다.  
3\. 해당 요청 및 응답 내용(404 오류 포함)은 접근 로그나 에러 로그 등의 로그 파일에 그대로 기록된다.  
4\. LFI 취약점이 존재하는 파라미터에 로그 파일의 경로를 입력하여, 해당 파일을 포함시킨다.  
5\. 로그 파일 내에 삽입된 악성 PHP 코드가 서버에 의해 해석되어 실행된다.

이 기법은 LFI 취약점 단독으로는 달성하기 어려운 원격 명령 실행을 가능하게 하며, 실제 침해 사고 사례에서도 자주 활용되는  공격 방법 중 하나이다.

---

#### 파일 업로드 공격 대응 방안 II

##### 파일 이름 난독화 및 파일 경로 비공개 처리

파일 업로드 시, 파일명을 난독화하여 저장 경로를 외부에 노출하지 않도록 처리하는 전략을 사용할 수 있다. 다만 이 방법은 조건부 대응 방안에 해당하며, SQL Injection 등의 공격에 의해 우회될 가능성이 존재하므로 단독으로는 충분한 대응책이 될 수 없다. 해당 방식은 웹 셸 실행을 직접적으로 차단하는 방안은 아니며, 따라서 비교적 간접적이고 미흡한 조치에 해당한다.

업로드한 파일을 다운로드 시 파일 경로가 노출될 수 있으나, 이는 파일에 직접 접근하는 방식을 사용하지 않고, 별도의 처리 파일(`download.php` 등)을 통해 간접적으로 제공함으로써 해결된다. 예를 들어, `download.php?fileId=254`와 같은 형태로 요청이 들어오면 해당 ID에 해당하는 파일을 서버 측에서 찾아 사용자에게 전달하게 되며, 이 과정에서 실제 파일 경로나 파일명은 사용자에게 노출되지 않는다. 또한, 해당 방식은 특정 사용자에 대해 특정 파일만 다운로드 가능하도록 **인가(Authorization)** 기능과 연계한 설계가 가능하다.

<br>

##### 파일의 데이터베이스 저장

가장 근본적인 차단 방식으로, 업로드된 파일을 웹 서버의 파일 시스템이 아닌 데이터베이스에 직접 저장하는 방법이 있다. 이때 <strong>BLOB(Binary Large Object)</strong> 또는 <strong>CLOB(Character Large Object)</strong>과 같은 데이터 타입을 활용하게 되며, 해당 파일은 웹 서버 경로 상에 존재하지 않기 때문에 웹 서버를 통해 실행될 가능성이 근본적으로 차단된다.

<br>

##### NAS 서버를 활용한 저장소 분리

<strong>NAS(Network Attached Storage)</strong>란 다수의 저장장치를 연결한 파일 서버로서, 네트워크로 접속하여 데이터에 접근하는 용도의 저장 장치 시스템을 말한다. 파일 업로드 기능 구현 시, 저장 전용 NAS 서버를 별도로 구성하여 업로드 파일을 해당 서버에 저장하는 방식도 고려될 수 있다. 이 경우 NAS에는 PHP 실행 엔진 등의 스크립트 실행 환경이 설치되어서는 안 되며, 이를 통해 업로드된 파일이 실행되는 것을 원천적으로 차단할 수 있다.

---

#### 파일 다운로드 취약점

download.php에 웹 요청이 있다 치자. 얘는 fileName을 파라미터로 받고, 해당 파일 내용을 전달해줌. 근데 거기에 취약점이 있다 치자. 다운로드 할 때 fileName에 ../../../../../../../etc/password를 전달해버리면, 서버에 저장된 비밀번호 정보들이 다운로드됨.. 심지어 얘는 그냥 파일을 다운로드하는 거라, 소스코드도 다운로드가 됨.. 물론 단점은 소스코드가 실행될 일은 없음.

`download.php`와 같이 파일 다운로드를 처리하는 서버 측 스크립트가 존재한다고 가정해 보자. 해당 파일은 일반적으로 `fileName`과 같은 파라미터를 전달받아, 해당 파일의 내용을 사용자에게 전송하는 방식으로 동작한다. 그러나 이 구현에 취약점이 존재할 경우, 공격자가 이를 악용하여 시스템 상의 임의 파일을 다운로드할 수 있다.

예를 들어, 다운로드 요청 시 fileName=`../../../etc/passwd`와 같이 디렉터리 트래버설 기법을 활용하여 입력값을 조작할 경우, 서버에 저장된 민감한 시스템 파일이 그대로 사용자에게 전달될 수 있다. 이와 같은 방식으로 시스템의 비밀번호 정보 등이 외부로 유출될 수 있으며, PHP 등 서버 측 언어로 작성된 소스 코드 파일조차 다운로드될 수 있다.

물론, 해당 취약점은 단순히 파일을 다운로드하는 동작에 국한되므로 다운로드된 소스 코드가 서버에서 실행되지는 않는다. 그러나 코드 내부의 로직, 경로, 인증 처리 방식 등이 노출될 수 있기 때문에 시스템 전체에 심각한 위협이 될 수 있다.

<br>

##### 침투 테스트 시

파일 다운로드 취약점이 발견되었을 경우, 가장 먼저 소스 코드 또는 시스템 구성 파일의 다운로드 가능 여부를 확인해야 한다. 운영 체제별로 대표적인 시스템 파일을 대상으로 테스트를 진행할 수 있다. 대표적인 예시로 리눅스 시스템의 `/etc/passwd` 파일이나 Windows 시스템의 `C:\boot.ini` 또는 `C:\WINNT\win.ini` 등이 존재한다. 이러한 파일들이 다운로드 가능한 경우, 해당 취약점은 시스템에 치명적인 영향을 미칠 수 있으며, 즉각적인 보안 대응이 요구된다.

<br>
<br>
<br>

### 과제

#### File Vuln CTF

CTF를 해결하며 파일 업로드 공격을 실습해 보자.

<br>

##### Web Shell 3

<img src="/data/Penetration%20Testing%20%7C%20Week%2015/1.png" alt="Web Shell 1" style="padding: 0 25%; background-color: white;">

링크의 주소로 접속하면 다음과 같은 회원제 게시판 애플리케이션으로 이동한다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/2.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/3.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/4.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/5.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/6.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/7.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/8.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/9.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/10.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/11.png)
경고 메시지 출력됨
그럼 소스 코드에 대충 `include("themes/" . $_COOKIE['theme']);` 이런 코드가 있는거임. 현재 include 함수가 실행되는 위치가 /index.php이니까, themes 디렉터리는 index.php와 같은 위치에 있다.

```text
/
├── index.php
├── themes/
│   ├── default.php
│   ├── hacker.php
│   └── modern.php
│   └── expert.php
└── uploads/
    └── 103_webshell.php
```

그럼 파일 구조가 대충 위와 같은 형태.
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/12.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/13.png)

왜 안될까? 웹쉘 코드엔 분명 이렇게 써 있다. `system($_GET['cmd']);` 이건 URL의 쿼리 스트링에서 cmd라는 파라미터의 값을 명령어로서 실행하라는 의미이다. 그런데 URL의 쿼리 스트링을 보면..? 아무것도 없다. /index.php로 요청을 보낸 거니까.. 그러니까 우리는 103_webshell.php 뒤에 ?cmd=ls를 붙이는 게 아니라 /index.php?cmd=ls로 요청을 보내야 하는 거다.

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/14.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/15.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/16.png)

segfault{CanExecuteImage}

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/17.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/18.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/19.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/20.png)
Content-Description: File Transfer
Content-Disposition: attachment; filename="index.php"
여기서 이거 설명하고 넘어가고.
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/21.png)
segfault{downloadSourceCode}

![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/22.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/23.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/24.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/25.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/26.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/27.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/28.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/29.png)
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/30.png)
글자비교
![Web Shell 1](/data/Penetration%20Testing%20%7C%20Week%2015/31.png)
segfault{byPassFiltering}