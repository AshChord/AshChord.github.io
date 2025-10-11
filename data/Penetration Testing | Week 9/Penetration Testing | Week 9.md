--- meta
title: Penetration Testing | Week 9
date: 2025/06/05
excerpt: Cross Site Scripting(XSS)
categories: 모의 해킹
---

### 강의 노트

#### Cross Site Scripting

<strong>Cross Site Scripting(XSS)</strong> 공격은 SQL Injection과 함께 대표적인 웹 애플리케이션 취약점으로 분류되며, 악의적인 사용자가 웹 페이지에 악성 스크립트를 삽입해 이를 다른 사용자의 브라우저에서 실행되도록 유도하는 공격이다. SQL Injection이 웹 서버를 대상으로 하는 공격인 반면, XSS는 클라이언트를 타겟으로 한다는 점에서 본질적인 차이를 보인다.

XSS 공격에서 악성 스크립트가 다른 사용자의 브라우저에서 실행되도록 하는 방법은 크게 두 가지로 나뉜다. 첫 번째 방법은 악성 스크립트를 서버에 저장한 후, 다른 사용자가 해당 서버에 저장된 스크립트에 접근하도록 유도하는 것이다. 이를 <strong>Stored XSS(저장형 XSS)</strong>라고 하며, 서버 측에 악성 스크립트가 지속적으로 저장되는 특징이 있다. 두 번째 방법은 악성 스크립트를 포함한 요청이 서버에 의해 반사되어 즉시 응답으로 전송되는 방식이다. 이 공격은 <strong>Reflected XSS(반사형 XSS)</strong>라고 하며, 스크립트가 서버에 저장되지 않고 즉시 클라이언트에게 전달되는 특징을 가진다.

---

#### XSS 공격 수행 과정

##### 1. 서버 응답 내 사용자 데이터 반환 여부 검토

XSS 공격이 성공적으로 수행되기 위해서는, 공격자가 삽입한 스크립트가 다른 사용자의 웹 브라우저에서 실행될 수 있어야 한다. 이때 중요한 점은 웹 서버가 반환하는 응답에 공격자의 데이터가 포함될 수 있는지를 사전에 확인하는 것이다. 웹 브라우저는 서버로부터 응답받은 HTML 문서나 Javascript 코드를 실행하는 방식으로 동작하므로, 공격자가 전송한 데이터가 웹 서버의 응답 내용에 포함될 가능성이 있는지를 점검하는 과정이 필수적이다. 이를 통해 공격자는 해당 데이터가 다른 사용자에게 전달될 때 실행될 수 있는지 여부를 파악한다.

##### 2. 특수 문자 변환 여부 확인

서버 응답에 공격자가 삽입한 데이터가 스크립트로 해석될 수 있도록 하려면, 데이터 내에 포함된 특수 문자가 정상적으로 서버를 거쳐 클라이언트 브라우저로 전달되는지 여부를 확인해야 한다. Javascript 및 HTML 문서 내에서 중요한 역할을 하는 특수 문자들이 그대로 전송될 수 있어야 공격자가 이를 활용하여 스크립트 형태의 데이터를 삽입할 수 있고, 이후 해당 스크립트가 브라우저에서 실행될 수 있다. 통상적으로, `<`, `'`, `"`, `>`의 4개 문자가 변환 없이 그대로 응답에 포함될 수 있는지를 점검한다.

##### 3. 스크립트 삽입

특수 문자가 정상적으로 처리되는 경우, 공격자는 서버에 악성 스크립트를 삽입할 수 있다. 일반적으로 사용되는 방법은 HTML의 `<script>` 태그를 활용한 방식으로, `<script>` 태그는 HTML 문서 내에서 Javascript 코드를 실행하는 영역을 나타낸다. 공격자는 이 태그를 활용하여 악성 자바스크립트 코드를 삽입하며, 예를 들어 `<script>alert(1);</script>`와 같은 형태로 페이로드를 삽입할 수 있다. 해당 페이로드가 포함된 페이지를 로드한 사용자의 브라우저에서는 Javascript 코드가 실행되며, 공격자는 경고 창을 띄우거나, 더 심각한 경우 쿠키 탈취, 악성 링크 실행 등의 결과를 유도할 수 있다.

> <strong>PoC(Proof of Concept)</strong>
>
> **PoC**란 어떠한 아이디어나 기술 등의 실행 가능성과 유효성을 입증하는 것을 말한다. 모의 해킹에서는 취약점이 실제로 존재한다는 것을 증명하는 데 사용되는 실행 가능한 코드나 방법을 제시하는 것을 의미한다.
>
>  XSS와 같은 취약점의 경우, 실제 악성 코드를 시스템에 삽입할 필요는 없으며 단지 해당 취약점으로 인한 코드 실행이 가능함을 입증하는 수준으로 충분하다.
>
> 이때 사용되는 코드 예시로는 `<script>alert('XSS');</script>`와 같이 간단한 JavaScript 코드가 포함된 스크립트가 있으며, 이는 취약점이 존재하고 이를 통해 악성 스크립트가 실행될 수 있음을 시연하는 데 사용된다. 이와 같은 코드를 **PoC 코드**라고 부르며, 해당 코드의 목적은 공격 가능성을 입증하는 데 한정된다.

<br>
<br>

### 과제

#### XSS CTF

![XSS CTF](/data/Penetration%20Testing%20%7C%20Week%209/1.png)

다양한 CTF 환경에서 XSS 취약점을 탐색해 보자. 이번 과제에서는 취약점을 악용하여 플래그를 추출하는 대신, 취약점을 식별하고 `alert(1);` 스크립트를 실행하는 단계까지만 진행하였다.

<br>

##### XSS 1

<img src="/data/Penetration%20Testing%20%7C%20Week%209/2.png" alt="XSS 1" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 SQL Injection Advanced CTF에서와 같은 회원제 게시판 애플리케이션으로 이동한다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/3.png)

XSS 공격의 특성을 고려하면, 작성한 글이 화면에 출력되는 게시판에 취약점이 존재할 확률이 높다. 따라서 우선 회원가입을 진행해 `any`/`any` 계정을 생성한 후, 로그인하여 게시판에 글을 작성해 보았다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/4.png)

게시판의 동작 방식에 따라 입력한 데이터가 자연스럽게 게시물 목록에 출력되는 것을 알 수 있다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/5.png)
![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/6.png)

Burp Suite를 통해 확인해 보면, 입력한 데이터가 서버 응답에 포함되어 전송된다는 사실을 보다 명확히 알 수 있다. 해당 지점에서 XSS 취약점이 발생할 수 있으므로, XSS 공격 수행을 위한 두 번째 절차인 특수 문자 변환 여부를 확인해 보았다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/7.png)

제목과 내용에 `<'">`를 입력하여 글을 생성하고 해당 게시물을 열람해 보았다. 제목에는 입력한 텍스트 `<'">`가 그대로 출력되었고, 내용에는 `&lt;'"&gt;`가 출력되었다. `&lt;`와 `&gt;`는 각각 `<`와 `>`이 HTML 인코딩 방식으로 변환된 결과이다. 이러한 HTML 인코딩은 특수 문자가 브라우저에 의해 HTML 문법으로 잘못 해석되지 않도록 하기 위해 사용되는데, 글의 내용에는 HTML 인코딩이 적용되어 HTML 태그로 해석되지 않고 순수 문자열로 출력된 반면, 글의 제목은 `<`와 `>`가 그대로 전송되어 HTML 태그처럼 인식되는 것을 알 수 있다.

다음으로 글의 제목이 `<script></script>`인 게시물을 생성한 후 열람해 보았다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/8.png)

예상대로 글 제목에 작성했던 `<script></script>`가 서버 응답에서는 `script` 태그의 형태로 전송되는 것을 알 수 있었다. 따라서 최종적으로 글의 제목이 `<script>alert(1);</script>`인 게시물을 생성하면 XSS 공격이 성공할 것으로 추측되었다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/9.png)

서버 응답에 스크립트가 정상적으로 포함되어 있는 것을 확인하였다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%209/10.png)

브라우저를 확인하면 알림 창이 표시된다.

<br>

##### XSS 2

<img src="/data/Penetration%20Testing%20%7C%20Week%209/11.png" alt="XSS 2" style="padding: 0 200px; background-color: white">

링크의 주소로 접속한 후, 우선 제목과 내용이 `<'">`인 게시물을 생성해 보았다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/12.png)
![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/13.png)

이번에는 제목과 내용 모두 HTML 인코딩이 이루어지는 것을 확인하였다. 따라서 게시물 열람 페이지에서는 XSS 취약점이 없을 것으로 판단하고, 다른 페이지를 조사해 보기로 결정하였다.

다음으로 떠올린 가능성은, 게시물 검색을 수행하는 경우 검색 창에 입력된 검색어가 화면에 지속적으로 표시되는 등의 방식으로 해당 검색어가 서버 응답 내에 포함되어 전송될 수 있다는 점이었다. 따라서 검색 창에 `<'">`을 입력해 보았다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/14.png)

그러나 검색어는 화면에 출력되지 않았다. 따라서 예상했던 동작 방식이 실제 구현과 다르다는 사실을 확인하였으나, 검색 결과가 반환되지 않은 점에 의문이 들어 패킷을 확인해 보았다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/15.png)

`option_val` 파라미터에 `username`이라는 값이 설정되어 있음을 확인하고 검색 과정에서 착오가 있었음을 인지하였다. 검색 기능이 기본적으로 작성자를 기준으로 동작하도록 되어 있었기 때문에, 제목이 `<'">`인 게시물이 검색되지 않았던 것이다.

그와 동시에 서버 응답에서 이상한 점이 발견되었는데, 응답 본문에 아래의 스크립트가 포함되어 있었기 때문이다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-xml">
  <span class="hljs-title function_">alert</span>(<span class="hljs-string">'&amp;lt;'</span><span class="hljs-string">"&amp;gt;에 대한 검색 결과가 존재하지 않습니다.');
</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
</code></pre>

실제로 검색을 수행했을 때 알림 창은 표시되지 않았다. 이에 대해 잠시 고찰한 결과, 문제의 원인을 빠르게 파악할 수 있었다.

알림 창이 표시되지 않은 것은 검색어에 포함된 작은따옴표(`'`) 및 큰따옴표(`"`) 문자가 별도의 변환 처리 없이 그대로 전달되었기 때문이었다. 위의 스크립트는 `alert()` 함수의 인자로 전달된 문자열을 알림 창에 출력하는데, 문자열 내에 삽입된 작은따옴표와 큰따옴표로 인해 문자열이 올바르게 종료되지 않았고, 그로 인해 문법 오류가 발생하여 스크립트가 정상적으로 실행되지 않았던 것이다.

이 점을 이용하면 해당 `<script>` 태그 내에 원하는 스크립트를 삽입할 수 있다. 이를테면 다음과 같은 문자열을 검색해 보자.

```text
');alert(1);('
```

해당 문자열이 `<script>` 태그 내에서 `alert('`와 `에 대한 검색 결과가 존재하지 않습니다.');` 사이에 삽입되므로, `<script>` 태그의 내용은 다음과 같이 변경된다.

```html
<script>
  alert('');
  alert(1);
  ('에 대한 검색 결과가 존재하지 않습니다.'); // 어떠한 동작도 수행하지 않는 무의미한 문자열 표현식
</script>
```

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/16.png)

서버 응답에 문법적으로 유효한 스크립트가 포함되어 있는 것을 확인하였고, 임의의 스크립트 `alert(1);`이 정상적으로 실행됨에 따라 XSS 공격이 가능함을 알 수 있다. 이 방식은 서버에 스크립트가 저장되지 않으므로 **Reflected XSS**에 해당한다.

다만 사용자가 `');alert(1);('`와 같은 검색어를 직접 입력할 가능성은 없다고 해도 무방하다. 따라서 이러한 **Reflected XSS** 공격의 경우, 다른 클라이언트의 브라우저에서 강제적으로 스크립트가 실행될 수 있게 하기 위해 해당 검색을 수행하는 **요청의 URL을 사용자에게 전달**하는 것을 고려할 수 있다.

그러나 이 경우, 검색 요청이 GET 방식이 아닌 POST 방식으로 전송되므로 검색 시 URL에 변화가 발생하지 않는다. 이와 같은 상황에서 Burp Suite를 활용하면 요청 방식을 변경할 수 있다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/17.png)

요청 전송 시 우클릭을 통해 컨텍스트 메뉴를 열면 요청 방식을 변경할 수 있는 항목이 존재한다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/18.png)

요청 방식을 GET 방식으로 변경하여 전송하면 정상적으로 서버 응답이 반환되는 것을 확인할 수 있으며, 해당 요청의 URL 역시 추출할 수 있다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/19.png)
![XSS 2](/data/Penetration%20Testing%20%7C%20Week%209/20.png)

복사한 URL의 주소로 접속하면 빈 알림 창이 표시된 후 텍스트 `1`이 출력된 알림 창이 표시된다.

<br>

##### XSS 3

<img src="/data/Penetration%20Testing%20%7C%20Week%209/21.png" alt="XSS 3" style="padding: 0 200px; background-color: white">

링크의 주소로 접속한 후 제목과 내용이 `<'">`인 게시물을 생성하고 XSS 취약점을 탐색하였지만, 예상한 대로 XSS 1과 XSS 2에 존재했던 취약점은 찾을 수 없었다.

다른 접근 방식을 모색하던 중, 애플리케이션 내에 게시판 이외에 마이페이지가 존재한다는 점을 상기하게 되었고 이에 가능성을 확인하고자 마이페이지로 이동해 보았다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%209/22.png)

현재 사용자의 아이디가 GET 방식으로 전송되고 있음을 확인하였다. 하지만 사용자 정보는 이미 세션 기반으로 저장·관리되고 있기 때문에 URL을 통해 별도로 전달할 필요가 없을 것이라고 판단되었고, 따라서 해당 요청을 활용해 보기로 결정하였다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%209/23.png)

마이페이지 접속 요청을 변조하여 `user`를 `<'">`로 변경하였고, 그 결과 아이디난의 플레이스홀더에 입력한 텍스트 `<'">`가 그대로 출력되는 것을 확인하였다. 모든 문자가 별도의 변환 처리 없이 전송되는 것을 확인했으므로, 이번에는 `user`를 다음과 같이 변경하였다.

```text
"/><script>alert(1);</script><
```

이때 아이디난에 해당하는 `input` 태그는 다음과 같이 변경된다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">name</span> = <span class="hljs-string">"id"</span> <span class="hljs-attr">type</span> = <span class="hljs-string">"text"</span> <span class="hljs-attr">placeholder</span>=<span class="hljs-string">""</span>/&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span>
  <span class="hljs-title function_">alert</span>(<span class="hljs-number">1</span>);
<span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
&lt;"/&gt; <span class="hljs-comment">// 존재하지 않는 태그로 일반 텍스트처럼 처리됨</span>
</code></pre>

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%209/24.png)

서버 응답에 스크립트가 정상적으로 포함되는 것을 확인하였다. 이 방식 또한 Reflected XSS에 해당하므로, 해당 요청의 URL로 접속해 스크립트가 실행되는지 재확인해 보았다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%209/25.png)

브라우저에서 알림 창이 표시되는 것을 확인하였다.

<br>

##### XSS 4

<img src="/data/Penetration%20Testing%20%7C%20Week%209/26.png" alt="XSS 4" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 제목과 내용이 `<'">`인 게시물을 생성해 보았다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/27.png)
![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/28.png)

게시물 목록 페이지에서는 HTML 인코딩이 이루어졌지만, 게시물 열람 페이지에서는 제목과 내용 모두 특수 문자가 그대로 출력되는 것을 확인하였다. 따라서 제목과 내용이 `<script></script>`인 게시물을 이어서 생성해 보았다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/29.png)

제목과 내용이 `<></>`로 출력되었다. 이를 통해 `script` 문자열이 필터링되고 있다는 사실을 알 수 있었다. 하지만 `script`를 제외한 문자열은 올바르게 출력되고 있었으므로, `script`를 빈 문자열로 대체하는 등의 로직이 사용되었다고 판단하였다. 따라서 이번에는 `<scrscriptipt></scrscriptipt>`를 사용하여 중간에 위치한 `script` 문자열이 제거되고 서버 응답에 `<script></script>`의 형태로 출력되도록 유도해 보았다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/30.png)

예상한대로 `<script>` 태그가 정상적으로 반환되었다. 다음으로 `<scrscriptipt>alert(1);</scrscriptipt>`을 사용하여 스크립트 실행을 시도하였다. 

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/31.png)

`alert` 문자열 역시 필터링되고 있음을 확인하였다. 마찬가지 방법으로 `<scrscriptipt>alalertert(1);</scrscriptipt>`를 대신 사용하였다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/32.png)

서버 응답에 스크립트가 정상적으로 포함되어 있는 것을 확인하였다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%209/33.png)

브라우저를 확인하면 알림 창이 표시된다.

<br>

##### XSS 5

<img src="/data/Penetration%20Testing%20%7C%20Week%209/34.png" alt="XSS 5" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 제목과 내용이 `<'">`인 게시물을 생성해 보았지만 게시물과 관련된 내용이 출력되는 모든 위치에서 HTML 인코딩이 적용되어 있음을 확인하였다.

여러 페이지를 이동해 가며 HTTP 기록을 확인하던 중, 모든 페이지에서 HTML 인코딩이 적용된 원인을 발견할 수 있었다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%209/35.png)

게시물 작성 페이지에 `<`와 `>`를 각각 `&lt;`와 `&gt;`로 변환시키는 Javascript 코드가 존재했다. 입력한 텍스트가 클라이언트 측에서 이미 변환된 상태로 서버에 전송되었던 것이다. Burp Suite는 서버 응답을 변조하는 기능을 제공하므로, 해당 코드를 제거하고 게시글 작성을 시도해 보았다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%209/36.png)
![XSS 5](/data/Penetration%20Testing%20%7C%20Week%209/37.png)

해당 Javascript 코드를 제거하고 다시 제목과 내용이 `<'">`인 게시물을 생성한 결과, 내용란에 작성한 특수문자가 그대로 출력되는 것을 확인하였다. 다른 위치에서는 서버 측에서도 HTML 인코딩이 수행되었으나, 게시물 내용은 클라이언트 측에서 실행되는 인코딩 스크립트에 의해서만 특수 문자 변환이 이루어지고 있었다. 따라서 게시물 내용에 `<script>alert(1);</script>`를 입력해 보았다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%209/38.png)

서버 응답에 스크립트가 정상적으로 포함되어 있는 것을 확인하였다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%209/39.png)

브라우저를 확인하면 알림 창이 표시된다.

<br>

##### XSS 6

<img src="/data/Penetration%20Testing%20%7C%20Week%209/40.png" alt="XSS 6" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 게시판 및 마이페이지를 면밀히 조사해 보았지만 XSS 취약점을 발견할 수 없었다.

마지막으로 XSS 공격의 가능성을 확인한 곳은 다름 아닌 `index.php` 페이지였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%209/41.png)

로그인을 수행하면 사용자의 아이디가 화면에 출력되고 있었다. 따라서, 회원 가입 페이지에서 아이디가 `<script>alert(1);</script>`인 계정을 만든 후 로그인하면 XSS 공격이 이루어질 것으로 판단하였다.

특수 문자의 변환 여부를 확인하기 위해 `<'">`와 같은 아이디를 먼저 시험해 볼 수도 있겠으나, 통상적으로 아이디에 대해서는 길이 제한이 있는 경우가 많기 때문에 이를 검증하기 위해 별도의 선행 조치 없이 전체 스크립트를 사용해 회원 가입을 진행해 보았다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%209/42.png)

회원 가입에 성공하였다. 이후 로그인 페이지에서 `<script>alert(1);</script>`/`any`를 입력하여 로그인을 시도하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%209/43.png)

로그인을 시도하자 서버 응답에 `alert()` 함수가 포함된 스크립트가 반환되었다. 응답 내용의 구조를 고려하면, 입력한 아이디가 `alert('[`와 `] 등록되지 않은 사용자입니다.')` 사이에 삽입된다는 사실을 파악할 수 있었다. 회원 가입에 성공했기 때문에 해당 아이디 `<script>alert(1);</script>`는 데이터베이스에 등록되었겠지만, 특수 문자가 포함된 관계로 백엔드 코드의 비정상적인 동작을 유도하여 미등록 아이디 안내 창이 표시된 것으로 보인다.

이는 로그인을 시도할 때 입력한 아이디가 미등록된 경우 해당 아이디가 그대로 화면에 출력되는 구조로 되어 있다는 의미이며, 따라서 로그인 페이지에서도 XSS 공격을 수행할 수 있다. XSS 2에서와 마찬가지로 스크립트 구조에 유의하여 아이디에 `');alert(1);('`를 입력하고 로그인을 시도하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%209/44.png)

서버 응답에 스크립트가 정상적으로 포함되는 것을 확인하였다. 이 방식 또한 Reflected XSS에 해당하므로, 해당 요청의 URL로 접속해 스크립트가 실행되는지 재확인해 보았다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%209/45.png)
![XSS 6](/data/Penetration%20Testing%20%7C%20Week%209/46.png)

브라우저에서 2개의 알림 창이 표시되며, 삽입한 스크립트로 인해 텍스트 `1`이 출력된 알림 창이 표시되는 것을 확인하였다.

---

#### XSS 취약점 점검 보고서

CTF 환경에서 XSS 취약점을 탐색하는 과정을 보고서 형태로 작성하였다.  
<a href="/data/Penetration%20Testing%20|%20Week%209/XSS 취약점 점검 결과 보고서.pdf" download>XSS 취약점 점검 결과 보고서</a>