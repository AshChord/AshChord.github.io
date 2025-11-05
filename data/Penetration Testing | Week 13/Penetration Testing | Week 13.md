--- meta
title: Penetration Testing | Week 13
date: 2025/07/05
excerpt: CSRF 대응 방안 및 웹 보안 정책
categories: 모의 해킹
---

### 강의 노트

#### CSRF 대응 방안

12주차에 CSRF 공격과 이를 방지하기 위한 CSRF 토큰에 대해 학습하였다. 그러나 CTF를 해결하는 과정에서 CSRF 토큰을 이용한 방법은 우회가 가능함을 확인할 수 있었다. 그렇다면 CSRF 공격에 효과적으로 대응하기 위한 다른 방안에는 어떤 것들이 있을까?

<br>

##### Referer 헤더 검증

대표적인 대응 방안 중 하나로, 서버로 전송되는 HTTP 요청의 `Referer` 헤더 값을 검증하는 방법이 있다.

`Referer` 헤더는 클라이언트가 요청을 전송할 때, 사용자가 머물렀던 웹 페이지의 URL을 함께 서버에 전달하는 역할을 한다. 예를 들어, 사용자가 `http://example.com/page1.html`에서 '다음 페이지' 버튼을 클릭하여 `http://example.com/page2.html`로 이동할 경우, 해당 요청의 `Referer` 헤더에는 `http://example.com/page1.html`이 포함된다. 이를 통해 서버는 해당 요청이 사용자의 자연스러운 동작에 의해 전송되었음을 추론할 수 있다.

CSRF 공격을 방지하기 위해 서버는 요청을 수신할 때마다 `Referer` 헤더를 점검하여, 요청이 신뢰할 만한 출처로부터 전송된 것인지 여부를 확인할 수 있다. 만약 요청이 불확실한 출처로부터 유래한 것으로 확인되면, 서버는 해당 요청을 차단하거나 무시함으로써 공격의 가능성을 사전에 제거할 수 있다.

비밀번호를 변경하는 요청의 예시를 생각해 보자. `Referer` 헤더의 값이 `http://example.com/mypage.php`인 경우 서버는 이를 자연스러운 비밀번호 변경 시도로 간주하고, 정상적으로 이를 처리한다. 반면 `Referer` 헤더의 값이 `http://example.com/notice_read.php`인 경우, 게시물 열람 페이지의 XSS 취약점을 이용한 CSRF 공격의 가능성이 있으므로 서버는 해당 요청을 차단하게 되는 것이다.

다만 `Referer` 헤더는 HTTP 요청에 필수적으로 포함되는 요소는 아니며, 브라우저 설정 등 클라이언트 환경에 따라 제공되지 않는 경우도 존재한다. 따라서 웹 서버의 백엔드에서는 `Referer` 헤더가 없는 경우에도 오류 없이 안전하게 동작하도록 설계된다. 이러한 설계는 사용자 경험과 접근성을 보장하는 데 필수적이나, 동시에 CSRF 공격 방어의 측면에서는 `Referer` 헤더를 전송하지 않음으로써 보안 검증을 우회하는 수단이 되기도 한다. 다음의 예시 코드를 보자.

```html
<head>
  <meta name="referrer" content="no-referrer">
</head>
```

위 예시에서 `<head>` 태그 내에 포함된 `<meta>` 태그는 요청을 전송할 때 `Referer` 헤더를 포함시키지 않도록 설정하는 역할을 한다. 서버가 단순히 의심스러운 출처로부터의 요청을 차단하는 방식으로 설계되어 있을 경우, 이러한 방법을 통해 `Referer` 헤더 검증을 우회할 수 있다.

따라서 `Referer` 헤더 검증만으로 CSRF를 방지하는 것은 불완전한 방식이며, 추가적인 보안 대책들을 함께 고려할 필요가 있다.

<blockquote>
<ul>
<li>HTTP 헤더 이름으로 사용되는 <code>Referer</code>는 <code>Referrer</code>의 오기이며, 초기 HTTP 사양에서 잘못 표기된 것이 그대로 표준으로 굳어지게 되었다.  </li>
<li style="margin-bottom: 0;"><code>&lt;meta&gt;</code> 태그의 <code>name</code> 속성, Javascript의 <code>document</code> 객체 속성 등에서는 올바른 표기인 <code>referrer</code>를 사용한다.</li>
</ul>
</blockquote>

<br>

##### 인증 정보 결합

CSRF 공격을 방어하기 위한 보다 근본적인 방안으로는, 요청 시 인증 정보를 결합하여 전송하는 방법이 있다.

예를 들어, 인터넷 뱅킹 서비스의 송금 페이지가 다음과 같은 형태라고 가정해 보자.

```html
<form action="/transfer" method="GET">
  <input type="text" name="to" placeholder="Recipient Account" required>
  <input type="number" name="amount" placeholder="Amount" required>
  <button type="submit">Transfer</button>
</form>
```

이때 송금 요청 URL은 `http://bank.com/transfer?to=recipient&amount=10000`와 같은 형태가 되며, 공격자는 해당 링크를 사용자에게 전달하는 것만으로 CSRF 공격을 수행할 수 있다. 하지만 송금 페이지에 다음과 같은 요소를 추가해 보자.

```html
<form action="/transfer" method="GET">
  <input type="text" name="to" placeholder="Recipient Account" required>
  <input type="number" name="amount" placeholder="Amount" required>
  <input type="password" name="account_password" placeholder="Account Password" required>
  <button type="submit">Transfer</button>
</form>
```

송금 과정에서 출금 계좌의 비밀번호 입력란이 추가되었다. 이로써 공격자는 계좌 비밀번호를 알지 못하는 한 송금 요청을 위조하는 것이 사실상 불가능해진다.

이처럼 요청을 전송할 때 인증 정보를 포함하도록 할 경우, 서버는 수신한 요청이 외부에서 발생한 것이 아니라 실제 사용자가 인증된 정보를 입력해 의도적으로 수행한 것임을 확인할 수 있다. 그러나 모든 종류에 요청에 대해 사용자에게 인증 정보를 요구하는 것은 사용자 경험을 크게 저해할 수 있으며, 실제 서비스 운영에 있어 현실적인 부담으로 작용할 수 있다. 따라서 일반적으로는 민감한 작업에 한해 인증 정보를 추가로 요구하고, 그 외의 요청에 대해서는 CSRF 토큰, `Referer` 헤더 검증과 같은 보안 기법을 함께 적용하여 실용성과 보안성을 균형 있게 유지하는 방식이 권장된다.

<br>

##### SameSite 쿠키 속성

공격자가 POST 방식의 요청을 위조해야 하는 경우, XSS 취약점을 연계하여 `<form>` 태그를 삽입하는 방식을 사용하였다. 그러나 이러한 공격 방식은 언뜻 보기에 불필요해 보일 수 있다. 왜냐하면 공격자는 본인이 제어 가능한 외부 웹 페이지에 악성 목적의 `<form>` 태그를 사전에 구성해 둔 후, 피해자가 해당 페이지에 접속하도록 유도하여 동일한 효과를 얻을 수 있을 것으로 기대되기 때문이다. 그렇다면 XSS 취약점을 연계해야 하는 이유가 무엇일까?

이는 웹 브라우저의 `SameSite` 쿠키 속성으로 인한 제한 때문이다. `SameSite` 속성은 브라우저가 어떤 상황에서 쿠키를 전송할지를 제어하는 보안 속성으로, 기본 값은 `Lax`로 지정되어 있다. 서버 응답의 `Set-Cookie` 헤더에 `SameSite=Lax`가 설정된 경우 브라우저는 기본적으로 동일한 웹 사이트 내 요청에 한해 쿠키를 전송하도록 제한하되, 사용자의 명시적 상호작용(링크 클릭을 통한 GET 요청 등)과 같이 안전하다고 판단되는 외부 사이트 요청에서는 쿠키 전송을 허용한다.

외부 웹 사이트에서 `<form>` 태그를 통해 피해자가 임의의 POST 요청을 전송하도록 시도할 경우, `SameSite=Lax` 설정에 의해 해당 요청에 인증 쿠키(세션 ID)가 포함되지 않으므로 세션이 식별되지 않은 채 요청이 무효화된다. 따라서 피해자의 세션을 활용한 공격을 성립시키기 위해서는 공격자가 동일한 웹 사이트 내에서 요청을 생성할 수 있어야 하며, 이는 결국 대상 웹 사이트 내부에 위치한 XSS 취약점을 이용하는 방식으로만 가능하게 된다. 요컨대, XSS 취약점을 연계하는 이유는 `SameSite` 속성의 제약을 우회하여 악성 요청이 사용자 세션의 유효한 인증 맥락 내에서 처리되도록 보장하기 위함이다.

---

#### 웹 보안 메커니즘: 자원 접근 제어

##### SOP

<strong>SOP(Same-Origin Policy, 동일 출처 정책)</strong>란 웹 브라우저의 보안 메커니즘 중 하나로, 서로 다른 출처(Origin) 간의 자원 접근을 엄격하게 제한하는 정책을 말한다. SOP는 웹 페이지 내의 Javascript가 자신의 출처와 일치하는 자원에만 자유롭게 접근할 수 있도록 허용하고 다른 출처의 자원에는 기본적으로 접근을 차단함으로써, 악의적인 사이트가 사용자의 민감한 데이터에 무단으로 접근하거나 조작하는 것을 방지한다. 예를 들어, `http://malicious.com`에 포함된 스크립트는 `http://example.com`의 DOM 요소에 접근하거나 쿠키를 조회하는 등의 행위를 할 수 없다.

> <strong>출처(Origin)</strong>
>
> **출처**란 웹 페이지나 자원의 위치를 식별하기 위한 단위로, 다음의 세 가지 요소로 이루어져 있다.
>
> - 프로토콜(스킴) - ex) `http`, `https`
> - 도메인 - ex) `google.com`
> - 포트 번호 - ex) `80`, `443`
>
> 세 가지 요소가 모두 일치하는 경우 동일 출처(Same Origin)라고 하며, 하나라도 일치하지 않는 경우 교차 출처(Cross Origin)라고 한다.

<br>

##### CORS

<strong>CORS(Cross-Origin Resource Sharing, 교차 출처 자원 공유)</strong>는 SOP의 엄격한 제한을 완화하기 위해 고안된 메커니즘으로, 서로 다른 출처 간에 안전하게 자원을 공유할 수 있도록 HTTP 헤더를 활용한다. 이때 핵심이 되는 헤더가 <strong>`Access-Control-Allow-Origin(ACAO)`</strong> 응답 헤더로, 주어진 출처에서 전송된 요청이 해당 응답 데이터에 접근하는 것을 허용할지를 나타낸다. 접근이 허용되는 경우 `ACAO` 헤더에 요청의 출처가 지정되며, 서버가 모든 출처를 허용할 경우 와일드카드(`*`)를 사용할 수 있다.

`ACAO` 헤더에 `*`를 사용하는 방식은 신뢰할 수 있는 출처를 개별적으로 명시하는 것에 비해 편리하지만, 해당 방식은 SOP의 보안적 의의를 무력화시킬 수 있다. 따라서 `*`의 사용에는 명확한 제한이 따르며, 요청에 <strong>자격 증명 정보(Credentials)</strong>가 포함된 경우에는 사용이 금지된다. 인증 쿠키(세션 ID)와 같은 자격 증명 정보가 포함된 요청에 대해 서버가 응답 데이터 접근을 허용하고자 할 때는 반드시 `ACAO` 헤더에 정확한 출처를 명시해야 한다.

자격 증명 정보와 관련한 응답 헤더로는 <strong>`Access-Control-Allow-Credentials(ACAC)`</strong> 응답 헤더가 있으며, 브라우저는 서버가 `ACAC` 헤더에 `true`를 설정한 경우에만 자격 증명 정보를 포함한 요청을 전송한다. 즉, `ACAO` 헤더의 값으로 `*`가 지정된 경우에는 `ACAC` 헤더의 값을 `true`로 설정하는 것이 허용되지 않는다.

> 일부 서버 구현에서는 `ACAO` 헤더에 `*`를 사용하는 대신, 모든 요청에 대해 `Origin` 헤더 값(요청이 발생한 출처)을 그대로 반영하여 응답하는 방식을 채택하기도 한다.  
> 그러나 이 방식은 실질적으로 출처에 대한 검증이 수행되지 않아 SOP의 보안 취지를 저해할 우려가 있으며, 특히 자격 증명 정보가 포함된 요청에 대해서는 민감한 정보의 노출로 이어질 수 있으므로 지양되어야 한다.

<br>
<br>
<br>

### 과제

#### 웹 개발