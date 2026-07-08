---
title: OverTheWire Bandit | Level 0 ~ 5
date: 2025/08/03
excerpt: Bandit Level 0 ~ 5 풀이
categories: Bandit, 워게임
---

## Level 0

### Description

SSH(Secure Shell)를 사용하여 bandit 워게임에 로그인해야 한다. 접속 정보는 다음과 같다.

```text
Host: bandit.labs.overthewire.org
Port: 2220
user: bandit0
password: bandit0
```

**관련 명령어**&emsp;|&emsp;`ssh`

> **참고 자료**
>
> - [Secure Shell - Wikipedia](https://en.wikipedia.org/wiki/Secure_Shell)  
> - [SSH to Port Other Than 22 - It’s FOSS](https://itsfoss.com/ssh-to-port/)  
> - [How to Use SSH(with Pictures) - wikiHow](https://www.wikihow.com/Use-SSH)

---

### Write-Up

`ssh` 명령어를 사용하면 원격 호스트에 접속할 수 있다. 명령 형식은 `ssh [user]@[host] -p [port]`와 같으므로, 터미널에 `ssh bandit0@bandit.labs.overthewire.org -p 2220`을 입력한다.

![Level 0](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/1.webp)

비밀번호 `bandit0`을 입력한다.

![Level 0](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/2.webp)

`bandit0` 계정으로 원격 접속에 성공하였다.

<br>
<br>
<br>

## Level 1

### Description

`bandit1` 계정으로 로그인하기 위한 비밀번호가 홈 디렉터리에 위치한 `readme` 파일에 저장되어 있다. 해당 비밀번호를 사용해 동일한 호스트와 포트로 SSH 접속을 수행해야 한다.

**관련 명령어**&emsp;|&emsp;`ls`&ensp;`cd`&ensp;`cat`&ensp;`file`&ensp;`du`&ensp;`find`

---

### Write-Up

`ls` 명령어를 사용하여 홈 디렉터리에 위치한 `readme` 파일을 확인할 수 있다.

![Level 1](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/3.webp)

`readme` 파일의 내용을 출력하기 위해 `cat readme`를 입력한다.

![Level 1](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/4.webp)

`bandit1` 계정의 비밀번호가 출력되었다.

![Level 1](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/5.webp)

해당 비밀번호를 사용해 SSH 접속을 시도하면 성공적으로 `bandit1` 계정으로 로그인된다.

<p style="text-align: center;">Password for Level 1: <span style="color: green; overflow-wrap: anywhere;">ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If</span></p>

<br>
<br>
<br>

## Level 2

### Description

`bandit2` 계정의 비밀번호는 홈 디렉터리에 위치한 `-` 파일에 저장되어 있다.

**관련 명령어**&emsp;|&emsp;`ls`&ensp;`cd`&ensp;`cat`&ensp;`file`&ensp;`du`&ensp;`find`

> **참고 자료**
>
> - [dashed filename - Google Search](https://www.google.com/search?q=dashed+filename)  
> - [Special Characters - Linux die.net](https://linux.die.net/abs-guide/special-chars.html)

---

### Write-Up

`ls` 명령어를 사용하여 홈 디렉터리에 위치한 `-` 파일을 확인할 수 있다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/6.webp)

`-` 파일의 내용을 출력하기 위해 `cat -`를 입력해 보았다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/7.webp)

하지만 기대와 달리, 터미널에 해당 내용이 출력되는 대신 사용자 입력을 기다리는 상태로 전환되었다. `-`는 일반적으로 `ls -al`과 같이 명령어 옵션을 지정하는 플래그로 사용되므로 의도치 않은 비정상적인 동작이 발생한 것으로 예상되었다.

정확한 원인을 알아내기 위해 `man cat`을 입력하여 `cat` 명령어의 매뉴얼 페이지를 확인해 보았다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/8.webp)

파일명이 `-`인 경우, 즉 `cat -` 명령을 사용하면 표준 입력을 읽어 출력한다고 한다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/9.webp)

실제로 `hello`를 입력해 보면, 해당 문자열이 그대로 출력되는 것을 확인할 수 있다.

> **EOF**
>
> <strong>EOF(End Of File)</strong>는 파일이나 입력 스트림에서 더 이상 읽을 데이터가 없다는 것을 나타내는 신호이다. 운영 체제 및 프로그래밍 언어는 이 신호를 통해 파일의 끝을 인식하거나, 입력의 종료 여부를 판단한다.  
> 리눅스 시스템에서 `cat -`과 같은 명령을 실행하면 표준 입력으로부터의 데이터 수신을 대기하는 상태로 전환되며, 이때 사용자는 `Ctrl + D` 키 조합을 통해 EOF 신호를 전송하여 입력 대기 상태를 종료할 수 있다.

보다 구체적인 이해를 위해 Description에 포함된 참고 자료를 살펴보았다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/10.webp)

공식 문서에 따르면, `-`는 옵션 플래그 외에도 표준 입출력을 대상으로 하는 리다이렉션을 나타내는 표기로 사용될 수 있음이 명시되어 있다. 따라서 파일명이 `-`인 경우, 일반적인 방식으로는 파일 내용을 출력하는 등의 작업을 수행할 수 없다.

이를 해결하기 위해서는 `*` 또는 `?` 등의 와일드카드를 활용하여 파일명을 명시하는 방법을 고려할 수 있다.  
또한, 참고 자료에서는 다음과 같이 파일명을 경로 형태로 명확히 작성하는 방식을 권장하고 있다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/11.webp)

지금까지 확인한 내용을 바탕으로, 터미널에 `cat ./-`를 입력하였다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/12.webp)

`bandit2` 계정의 비밀번호가 출력되었다.

![Level 2](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/13.webp)

해당 비밀번호를 사용해 `bandit2` 계정으로 로그인에 성공하였다.

<p style="text-align: center;">Password for Level 2: <span style="color: green; overflow-wrap: anywhere;">263JGJPfgU6LtdEvgfWU1XP5yac29mFx</span></p>

<br>
<br>
<br>

## Level 3

### Description

`bandit3` 계정의 비밀번호는 홈 디렉터리에 위치한 `--spaces in this filename--` 파일에 저장되어 있다.

**관련 명령어**&emsp;|&emsp;`ls`&ensp;`cd`&ensp;`cat`&ensp;`file`&ensp;`du`&ensp;`find`

> **참고 자료**
>
> - [spaces in filename - Google Search](https://www.google.com/search?q=spaces+in+filename)

---

### Write-Up

`ls` 명령어를 사용하여 홈 디렉터리에 위치한 `--spaces in this filename--` 파일을 확인할 수 있다.

![Level 3](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/14.webp)

파일명이 `-`로 시작하므로, 경로를 명시하여 `cat ./--spaces in this filename--`의 형태로 파일 내용 출력을 시도해 보았다.

![Level 3](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/15.webp)

파일 내용이 출력되는 대신 `./--spaces`, `in`, `this`, `filename--`이라는 파일 또는 디렉터리가 존재하지 않는다는 메시지가 출력되었다. 이를 통해 `cat` 명령어가 공백을 기준으로 복수의 파일명을 구분하는 것을 확인할 수 있었다.

그렇다면 파일명에 공백이 포함되는 경우, 일반적인 방법으로는 해당 파일의 내용을 출력할 수 없다. 이를 해결하기 위해 참고 자료의 안내에 따라 관련 정보를 검색해 보았다.

![Level 3](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/16.webp)

공백 문자를 역슬래시(`\`) 문자를 사용해 이스케이프하거나, 파일명 전체를 따옴표로 감싸는 방식을 사용할 수 있다고 한다. 이에 따라 터미널에 `cat ./--spaces\ in\ this\ filename--`를 입력하였다.

![Level 3](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/17.webp)

`bandit3` 계정의 비밀번호가 출력되었다.

![Level 3](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/18.webp)

해당 비밀번호를 사용해 `bandit3` 계정으로 로그인에 성공하였다.

<p style="text-align: center;">Password for Level 3: <span style="color: green; overflow-wrap: anywhere;">MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx</span></p>

<br>
<br>
<br>

## Level 4

### Description

`bandit4` 계정의 비밀번호는 `inhere` 디렉터리에 위치한 숨김 파일에 저장되어 있다.

**관련 명령어**&emsp;|&emsp;`ls`&ensp;`cd`&ensp;`cat`&ensp;`file`&ensp;`du`&ensp;`find`

---

### Write-Up

`ls` 명령어를 사용하면 홈 디렉터리에 위치한 `inhere` 디렉터리를 확인할 수 있다.

![Level 4](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/19.webp)

`cd inhere`를 입력하여 `inhere` 디렉터리로 이동한 후 `ls` 명령어를 입력해 보았다.

![Level 4](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/20.webp)

실행 결과, 출력되는 내용이 존재하지 않았다. `inhere` 디렉터리에 숨김 파일이 위치하고 있으므로, `ls -a` 명령어를 사용하여 숨김 파일을 포함한 전체 파일 및 디렉터리 목록을 출력해 보았다.

![Level 4](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/21.webp)

`.`로 시작하는 숨김 파일인 `...Hiding-From-You` 파일을 확인하였다. 이후 해당 파일의 내용을 출력하기 위해 `cat ...Hiding-From-You`를 입력하였다.

![Level 4](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/22.webp)

`bandit4` 계정의 비밀번호가 출력되었다.

![Level 4](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/23.webp)

해당 비밀번호를 사용해 `bandit4` 계정으로 로그인에 성공하였다.

<p style="text-align: center;">Password for Level 4: <span style="color: green; overflow-wrap: anywhere;">2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ</span></p>

<br>
<br>
<br>

## Level 5

### Description

`bandit5` 계정의 비밀번호는 `inhere` 디렉터리에 위치한 파일들 중, 사람이 읽을 수 있는 형식으로 기록된 유일한 파일에 저장되어 있다.

**관련 명령어**&emsp;|&emsp;`ls`&ensp;`cd`&ensp;`cat`&ensp;`file`&ensp;`du`&ensp;`find`

---

### Write-Up

`ls` 명령어를 사용하면 홈 디렉터리에 위치한 `inhere` 디렉터리를 확인할 수 있다.

![Level 5](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/24.webp)

`cd inhere`를 입력하여 `inhere` 디렉터리로 이동한 후 `ls` 명령어를 입력해 보았다.

![Level 5](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/25.webp)

총 10개의 파일이 확인되었다. 이 중 사람이 읽을 수 있는 형식의 파일이 유일하게 존재하며, 해당 파일에 비밀번호가 저장되어 있다. 따라서 `cat ./*` 명령어를 사용하여 모든 파일의 내용을 출력해 보았다.

![Level 5](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/26.webp)

알 수 없는 데이터 사이에서 `bandit5` 계정의 비밀번호가 출력되는 것을 확인할 수 있다. 보다 정확한 확인을 위해 `file ./*` 명령어를 사용하여 각 파일이 어떤 유형인지 출력해 보았다.

![Level 5](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/27.webp)

`-file07` 파일만이 유일하게 일반적인 ASCII 텍스트로 작성된 파일임을 알 수 있다.

![Level 5](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/28.webp)

`cat ./-file07`을 입력하면 `bandit5` 계정의 비밀번호를 재차 확인할 수 있다.

![Level 5](/data/OverTheWire%20Bandit%20|%20Level%200%20~%205/29.webp)

해당 비밀번호를 사용해 `bandit5` 계정으로 로그인에 성공하였다.

<p style="text-align: center;">Password for Level 5: <span style="color: green; overflow-wrap: anywhere;">4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw</span></p>