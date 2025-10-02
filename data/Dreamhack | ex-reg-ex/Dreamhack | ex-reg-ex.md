--- meta
title: Dreamhack | ex-reg-ex
date: 2025/07/30
excerpt: ex-reg-ex 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 해킹을 위한 팁  
**[Wargame]**: ex-reg-ex

![Description](/data/Dreamhack%20|%20ex-reg-ex/1.png)

<br>
<br>
<br>

### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 입력 양식이 포함된 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20|%20ex-reg-ex/2.png)

특정 정규식 표현과 일치하는 문자열을 입력하면 플래그가 출력되는 구조로 예상된다.  
이후 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.

<img src="/data/Dreamhack%20|%20ex-reg-ex/3.png" alt="Write-Up" style="padding: 0 10%; background-color: #24292F">

플래그는 `FLAG` 변수에 저장되어 있고, 사용자가 입력한 문자열이 정규식 표현 `r'dr\w{5,7}e\d+am@[a-z]{3,7}\.\w+'`와 일치할 때 출력되는 것을 알 수 있다.

해당 정규식 표현을 해석하면 다음과 같다.

| 패턴          | 의미                         |
|--------------|-----------------------------|
| `dr`         | 문자열 `dr`                   |
| `\w{5,7}`    | 영문자, 숫자, 밑줄(_) 중 5 ~ 7개 |
| `e`          | 문자 `e`                     |
| `\d+`        | 숫자 1개 이상                  |
| `am`         | 문자열 `am`                   |
| `@`          | `@` 문자                     |
| `[a-z]{3,7}` | 알파벳 소문자 3 ~ 7개           |
| `\.`         | 마침표(`.`) 문자               |
| `\w+`        | 영문자, 숫자, 밑줄(_) 중 1개 이상 |

해당 정규식 표현에 맞춰 구성된 예시 입력 문자열은 `draaaaae1am@aaa.a`와 같은 형태가 될 수 있다.  
웹 페이지에서 해당 문자열을 입력해 보았다.

![Write-Up](/data/Dreamhack%20|%20ex-reg-ex/4.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">e64a267ab73ae3cea7ff1255b5f08f3e5761defbfa6b99f71cbda74b7a717db3</span>}</span></p>