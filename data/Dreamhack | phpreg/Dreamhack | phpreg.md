--- meta
title: Dreamhack | phpreg
date: 2025/07/31
excerpt: phpreg 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: phpreg

![Description](/data/Dreamhack%20|%20phpreg/1.png)

<br>
<br>
<br>

### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 로그인 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20|%20phpreg/2.png)

알맞은 Nickname과 Password를 알아내기 위해, 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.  
소스 코드는 다음과 같이 `index.php`와 `step2.php`로 구성되어 있다. CSS 관련 코드는 생략하였다.

![Write-Up](/data/Dreamhack%20|%20phpreg/3.png)
![Write-Up](/data/Dreamhack%20|%20phpreg/4.png)

`index.php`의 소스 코드를 보면 로그인 양식을 `step2.php`로 제출한다는 것을 알 수 있다.
`step2.php`에는 사용자 입력값을 받아 로그인을 처리하는 PHP 코드가 포함되어 있다.  

구체적인 로그인 처리 절차는 다음과 같다.

```php
if (preg_match("/[a-zA-Z]/", $input_pw)) {
  echo "alphabet in the pw :(";
} else {
  ...
}
```

우선 위의 조건문을 통해 Password에는 알파벳을 포함시킬 수 없다.

```php
$name = preg_replace("/nyang/i", "", $input_name);
$pw = preg_replace("/\d*\@\d{2,3}(31)+[^0-8\"]\!/", "d4y0r50ng", $input_pw);
```

`else` 문 내의 코드는 위와 같이 시작한다.  
Nickname에 `nyang`(대소문자 불구분) 문자열이 포함될 경우, 이를 빈 문자열로 치환한다.
Password의 경우, 정규식 표현 `/\d*\@\d{2,3}(31)+[^0-8\"]\!/`에 해당하는 문자열을 `d4y0r50ng`로 치환한다. 해당 필터링 정규식 표현을 해석하면 다음과 같다.

| 패턴        | 의미                                    |
|------------|----------------------------------------|
| `\d*`      | 숫자 0개 이상                             |
| `\@`       | `@` 문자                                |
| `\d{2,3}`  | 숫자 2 ~ 3개                             |
| `(31)+`    | 문자열 `31` 1개 이상                       |
| `[^0-8\"]` | `0 - 8` 범위의 숫자 및 `"` 문자를 제외한 나머지 |
| `\!`       | `!` 문자                                |

```php
if ($name === "dnyang0310" && $pw === "d4y0r50ng+1+13") {
  echo '
  <h4>Step 2 : Almost done...</h4>
  <div class="door_box">
    <div class="door_black"></div>
    <div class="door">
      <div class="door_cir"></div>
    </div>
  </div>';
  ...
}
```

Nickname과 Password를 각각 치환한 결과가 `dnyang0310`, `d4y0r50ng+1+13`인 경우 조건문을 통과하며 `Step 2: Almost done...`이 출력된다.
조건문 통과를 위한 알맞은 Nickname과 Password값의 예시는 다음과 같다.

| Nickname          | Password       |
|-------------------|----------------|
| `dnynyangang0310` | `@11319!+1+13` |

```php
$cmd = $_POST["cmd"] ? $_POST["cmd"] : "";

if ($cmd === "") {
  echo '
    <p>
      <form method="post" action="/step2.php">
        <input type="hidden" name="input1" value="'.$input_name.'">
        <input type="hidden" name="input2" value="'.$input_pw.'">
        <input type="text" placeholder="Command" name="cmd">
        <input type="submit" value="제출">
        <br/><br/>
      </form>
    </p>
  ';
}
// cmd filtering
else if (preg_match("/flag/i", $cmd)) {
  echo "<pre>Error!</pre>";
} else {
  echo "<pre>--Output--\n";
  system($cmd);
  echo "</pre>";
}
```

이후 서버는 POST 요청으로 전달받은 `cmd` 파라미터를 확인하며, 값이 없을 경우 조건문을 통과하여 새로운 입력 양식을 생성한다. 해당 양식은 `cmd` 값을 `step2.php`로 제출하도록 설정되어 있다.  
첫 로그인 시에는 `cmd` 값이 없기 때문에 반드시 입력 양식이 생성되고, 이후 `cmd` 값을 제출하면 `else if` 문으로 흐름이 넘어간다. 이때 `cmd` 값에 `flag`(대소문자 불구분)가 존재하면 에러가 발생하며, 그렇지 않으면 `system($cmd)`을 통해 해당 명령어가 실행된다.

플래그는 `../dream/flag.txt` 위치에 존재하므로, 제한 조건을 우회하여 명령을 실행시키기 위해서는 `cat ../dream/fla?.txt` 등을 사용할 수 있다.

플래그 출력을 위한 방법이 정리되었으므로, 웹 페이지로 이동하여 `dnynyangang0310`/`@11319!+1+13`를 입력해 보자.

![Write-Up](/data/Dreamhack%20|%20phpreg/5.png)

예상대로 `Step 2: Almost done...`가 출력되며 명령어 입력 양식이 생성되었다. `cat ../dream/fla?.txt`를 입력한다.

![Write-Up](/data/Dreamhack%20|%20phpreg/6.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">ad866c64dabaf30136e22d3de2980d24c4da617b9d706f81d10a1bc97d0ab6f6</span>}</span></p>