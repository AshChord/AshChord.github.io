--- meta
title: Dreamhack Wargames | Web Hacking I
date: 2025/10/05
excerpt: Dreamhack Wargames 풀이 I
categories: Dreamhack, 워게임
---

### devtools-sources

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/1.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 웹 페이지를 구성하는 다양한 파일들을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/2.png)

대부분의 웹 페이지에서 진입점 페이지에 해당하는 `index.html` 파일을 브라우저를 사용하여 열람해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/3.png)

개발자 도구의 Sources 탭 기능을 활용하여 `DH{...}` 형식의 플래그를 찾아야 하므로, `DH` 문자열을 검색함으로써 소스 내에 존재하는 플래그를 발견할 수 있을 것으로 예상된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/4.png)

개발자 도구를 연 뒤 Sources 탭으로 이동하면 위와 같이 페이지를 구성하고 있는 요소들을 확인할 수 있다. 이때 각각의 파일을 클릭하고 `Ctrl + F`(Mac의 경우 `Cmd + F`) 단축키를 사용하여 문자열 검색을 수행할 수도 있으나, `Ctrl + Shift + F`(Mac의 경우 `Cmd + Opt + F`) 단축키를 사용하면 모든 파일을 대상으로 문자열을 검색할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/5.png)

해당 커맨드를 입력한 뒤 검색 패널에서 `DH` 문자열을 검색하면, `main.scss` 파일에 포함된 플래그가 출력된다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">2ed07940b6fd9b0731ef698a5f0c065be9398f7fa00f03ed9da586c3ed1d54d5</span>}</span></p>

<br>
<br>
<br>

### Carve Party

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/6.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `jack-o-lantern.html` 파일을 확인할 수 있다.  
파일을 열람하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/7.png)

호박 이미지를 10,000번 클릭하면 플래그가 출력될 확률이 높으나 시간적 소모가 상당할 것이므로, 이를 우회하기 위해 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/8.png)

웹 페이지의 JavaScript 코드 내용을 확인해 보면, 사용자의 클릭 횟수는 `counter` 변수에 저장되며 총 10,000번의 클릭이 이루어지는 동안 화면에 그림을 그리는 것을 알 수 있다.

호박 이미지를 클릭할 때 `counter` 변수의 값을 증가시키는 코드(`counter += 1`)를 수정하여, 한 번의 클릭으로 10,000번 클릭한 것과 동일한 효과를 내는 것도 가능하다. 그러나 뒤에 이어지는 조건문 때문에 이러한 방식으로는 간단히 처리할 수 없다.

```js
if (counter <= 10000 && counter % 100 == 0) {
  for (var i = 0; i < pumpkin.length; i++) {
    pumpkin[i] ^= pie;
    pie = ((pie ^ 0xff) + (i * 10)) & 0xff;
  }
}
```

해당 조건문을 살펴 보면, `counter` 변수의 값이 100의 배수일 경우 `pumpkin` 배열과 `pie` 변수를 대상으로 복잡한 연산이 수행된다. 즉, 클릭이 100회 발생할 때마다 `pumpkin` 및 `pie` 값의 재조정 과정이 반복적으로 실행되는 구조이다.

이에 따른 간단한 해결 방안으로, 매 클릭 시 `counter` 변수가 100씩 증가하도록 코드를 수정(`counter += 100`)한 후 100회 클릭을 수행하여 동작을 검증해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/9.png)

그 결과 화면에 플래그가 정상적으로 렌더렝되는 것을 확인할 수 있었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">I_lik3_pumpk1n_pi3</span>}</span></p>

<br>
<br>
<br>

### funjs

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/10.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `index.html` 파일을 확인할 수 있다.  
파일을 열람하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/11.png)

소스 코드를 확인해 보면, 다음과 같은 JavaScript 코드가 존재한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/12.png)

분석 대상인 `main()` 함수가 난독화되어 있어 동작을 파악하기 어려웠으므로, 실제로 데이터를 입력한 후 브라우저의 개발자 도구를 활용하여 `main()` 함수를 실행 상태에서 디버깅해 보기로 결정하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/13.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/14.png)

위와 같이 `main()` 함수에 중단점을 설정한 후, `test` 문자열을 입력하고 제출해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/15.png)

실행 흐름을 따라가면 입력한 문자열이 `flag` 변수에 저장되는 것을 확인할 수 있다. 이후 `text2img()` 함수가 호출되며, `return` 문에 도달함과 동시에 함수 실행이 종료된다. 메인 함수의 반환 지점을 자세히 살펴보면 다음과 같다.

```js
if (flag[_0x374fd6(0x17c)] != 0x24) { // flag = "test"
  text2img(_0x374fd6(0x185));
  return;
}
for (var i = 0x0; i < flag[_0x374fd6(0x17c)]; i++) {
  if (flag[_0x374fd6(0x176)](i) == operator[i % operator[_0x374fd6(0x17c)]](_0x4949[i], _0x42931[i])) { } else {
    text2img(_0x374fd6(0x185));
    return;
  }
}
text2img(flag);
```

코드 내에서 `_0x374fd6()` 함수의 반환 결과가 반복적으로 사용되는 것을 알 수 있다. `_0x374fd6()` 함수는 상단에 정의되어 있으며, 해당 선언문이 이미 실행된 이후의 시점이므로 콘솔을 통해 이 함수의 반환값을 직접 확인 가능하다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/16.png)

`_0x374fd6(0x17c)`는 문자열 `length`를, `_0x374fd6(0x176)`는 문자열 `charCodeAt`을, `_0x374fd6(0x185)`는 문자열 `NOP !`를 각각 반환함을 확인하였다. 따라서 위의 코드는 다음과 같이 수정할 수 있다.

```js
if (flag['length'] != 0x24) { // flag = "test"
  text2img('NOP !');
  return;
}
for (var i = 0x0; i < flag['length']; i++) {
  if (flag['charCodeAt'](i) == operator[i % operator['length']](_0x4949[i], _0x42931[i])) { } else {
    text2img('NOP !');
    return;
  }
}
text2img(flag);
```

이 시점에서는 해당 코드의 동작을 비교적 명확하게 파악할 수 있다. 첫 번째 조건문은 입력 문자열의 길이를 검사하는 로직으로, 문자열의 길이가 0x24(=36)이 아닌 경우 화면에 `NOP !`을 렌더링한다. 문자열의 길이가 36인 경우에는 이후의 반복문으로 실행 흐름이 이동한다.

반복문에서는 입력 문자열의 각 문자에 대해 유니코드 값을 취한 후, `operator[i % operator['length']](_0x4949[i], _0x42931[i])`의 반환값과 비교한다. 이 비교 과정에서 하나라도 불일치가 발생하면 `NOP !`이 렌더링되며, 모든 조건이 만족될 경우 화면에 정답 문자열(`flag`)이 출력되는 구조이다.

이제 비교 연산에 사용되는 값들이 무엇인지 확인하면 플래그를 도출할 수 있다. 이를 파악하기 위해 콘솔에 다음 스크립트를 입력하였다.

```js
var str = '';
for (var i = 0; i < 36; i++) {
  str += String.fromCharCode( // String.fromCharCode(): 유니코드 값을 문자열로 변환시키는 메서드
    operator[i % operator['length']](_0x4949[i], _0x42931[i]))
};
```
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/17.png)

성공적으로 플래그가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">cfd4a77a013ea616d3d5cc0ddf87c1ea</span>}</span></p>

<br>
<br>
<br>

### secure Mail

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/18.png)

---

#### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `secure-mail.html` 파일을 확인할 수 있다.  
파일을 열람하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/19.png)

무작위 생년월일을 입력한 뒤 `Confirm` 버튼을 누르면 다음과 같이 알림 창에 `Wrong` 메시지가 표시돤다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/20.png)

웹 사이트의 동작을 분석하기 위해 소스 코드를 확인해 보았다. JavaScript 코드 전체가 난독화되어 있고 분량이 매우 방대한 관계로 분석 과정에서 핵심적으로 살펴 본 부분만을 발췌하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/21.png)

생년월일을 입력한 후 `Confirm` 버튼을 클릭하면, 입력된 생년월일이 인자로 전달되어 `_0x9a220()` 함수가 실행됨을 확인할 수 있다. `_0x9a220()` 함수의 정의는 JavaScript 코드의 최하단에 위치하며, 상단의 코드를 분석하지 않는 이상 내부 동작을 명확히 파악하기는 어렵다. 다만 `Wrong` 알림 창을 출력하는 코드의 위치는 확인 가능하다. 해당 부분의 전후 코드를 보다 자세히 살펴 보자.

```js
if (_0x3eebe5(odradurs1, null, raw = !![]) != _0x540d50('0x55', 'dGZC'))
  return alert('Wrong'),
    ![];
return document['write'](_0x540d50('0x66', 'AZ$r') + odradurs1 + '\x22>'),
  !![];
```

`_0x9a220()` 함수는 특정 조건이 참일 경우 `Wrong` 알림 창을 표시하고 `![]`를 반환하며, 조건이 거짓일 경우 화면에 특정 데이터를 출력하며 `!![]`를 반환한다. 반환 값 앞에 `!` 연산자가 사용된 것으로 미루어 불리언 값일 것으로 추정되었는데, 실제 콘솔에서 확인한 결과 `![]`는 `false`, `!![]`는 `true`를 의미하는 것으로 확인되었다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/22.png)

> **Truthy & Falsy**
>
> JavaScript에서 불리언 값(True, False)에 해당하지 않지만 불리언 문맥(if 문 등)에서 True로 평가되는 값을 <strong>Truthy Value(참 같은 값)</strong>, False로 평가되는 값을 <strong>Falsy Value(거짓 같은 값)</strong>라고 한다.
>
> 대표적인 **Truthy & Falsy Value**의 예는 다음과 같다.
>
> - **Truthy Values**: `0` 이외의 모든 숫자, 빈 문자열이 아닌 모든 문자열, `[]`(빈 배열), `{}`(빈 객체)
> - **Falsy Values**: 숫자 `0`, `''`(빈 문자열), null, undefined, NaN

현재까지의 정황을 종합적으로 고려해 보면, `_0x9a220()` 함수는 입력된 생년월일의 정답 여부를 반환하는 함수로 추정되며 올바른 생년월일이 입력될 경우 화면에 플래그를 출력하는 동작을 수행하는 것으로 보인다.

JavaScript 코드가 지나치게 복잡하여 추가적인 분석을 진행하기보다는, Brute Force 기법을 활용해 정답 생년월일을 탐색하는 방식이 더 효율적이라고 판단하였다. 이에 따라 콘솔에 다음과 같은 스크립트를 작성하였다.

```js
// 숫자를 2자리 문자열로 변환하는 함수
function toTwoDigits(num) {
  return num < 10 ? '0' + num.toString() : num.toString(); // 예: 1 → '01', 10 → '10'
}

// 연도 범위(00 ~ 99)
for (var i = 0; i < 100; i++) {
  // 달 범위(01 ~ 12)
  for (var j = 1; j < 13; j++) {
    // 일 범위(01 ~ 31)
    for (var k = 1; k < 32; k++) {
      // 입력 생년월일
      var birthDate = toTwoDigits(i) + toTwoDigits(j) + toTwoDigits(k);
      if (_0x9a220(birthDate)) {
        console.log(birthDate);
      }
    }
  }
}
```

`_0x9a220()` 함수는 `false`를 반환하는 경우 동시에 알림 창을 출력하므로, 반복문 실행 시마다 알림 창의 확인 버튼을 수동으로 처리해야 하는 상황을 방지하기 위해 소스 코드에서 `alert('Wrong')`을 제거한 상태로 위의 스크립트를 실행하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/23.png)

스크립트를 실행한 결과 정답 생년월일은 `960229`임을 확인할 수 있었으며, `_0x9a220()` 함수가 `true`를 반환함과 동시에 플래그 값이 포함된 이미지가 출력되었다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">BruteF0rce_th3_secur3_mail</span>}</span></p>

<br>
<br>
<br>

### cookie

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/24.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/25.png)

`Login` 버튼을 클릭하면 로그인 화면으로 이동한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/26.png)

목표는 admin 계정으로 로그인하는 것이지만, 현재로서는 파악된 정보가 전무한 상태이므로 우선 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/27.png)

`index()` 함수를 보면 admin 계정으로 로그인된 경우 홈 페이지에 플래그가 출력되는 것을 알 수 있다. 핵심은 현재 로그인된 계정을 판단하는 방식인데, 쿠키에 저장된 값 중 `username`에 해당하는 값을 기준으로 계정 유형을 판별한다.

`login()` 함수는 로그인 과정을 처리하며, 인증에 성공할 경우 현재 로그인된 계정의 `username`을 쿠키에 저장한다. `users` 객체에 guest 계정 정보가 존재하므로, 우선 해당 계정으로 로그인을 시도해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/28.png)

`guest`/`guest`를 입력하고 로그인하면 홈 페이지로 이동하며 `you are not admin`이라는 메시지가 출력된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/29.png)

개발자 도구를 통해 쿠키 값을 확인하면 `username` 필드에 `guest`가 저장되어 있음을 알 수 있다. `index()` 함수는 오직 쿠키의 `username` 필드에 저장된 값만을 기준으로 로그인된 계정을 판별하므로, 해당 값을 `guest`에서 `admin`으로 변경하면 admin 계정으로 로그인한 것처럼 동작하게 할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/30.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/31.png)

쿠키 값을 수정한 뒤 페이지를 새로고침하면 플래그가 출력된다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">7952074b69ee388ab45432737f9b0c56</span>}</span></p>

<br>
<br>
<br>

### session-basic

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/32.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 다음과 같은 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/33.png)

admin 계정으로 로그인하기 위한 단서를 찾기 위해 첨부 파일을 다운로드하여 소스 코드를 확인해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/34.png)

`index()` 함수는 admin 계정으로 로그인된 경우 홈 페이지에 플래그를 출력시키는 함수이다. 로그인된 계정의 유형을 판별하기 위해 쿠키에 저장된 세션 ID(`sessionid`)에 대응되는 `username` 값을 조회한다.

`login()` 함수는 로그인에 성공할 경우 랜덤한 문자열을 생성하여 이를 세션 ID(`sessionid`)로 사용하고, 해당 ID를 쿠키에 저장하는 동시에 세션 저장소에 `sessionid`-`username` 쌍을 저장한다.

`/admin` 엔드포인트로 접근하면 실행되는 `admin()` 함수는 세션 정보를 반환한다. 주석 처리된 코드를 보면 admin 계정만이 해당 페이지에 접근할 수 있도록 제한하려는 의도가 있었던 것으로 보이나, 현재는 누구나 해당 엔드포인트를 통해 세션 정보를 조회할 수 있는 상태이다.

소스 코드 최하단을 확인하면, 이 웹 애플리케이션은 초기 실행 시 세션 저장소에 admin 계정의 세션 ID를 미리 저장하도록 구현되어 있음을 알 수 있다. 따라서 `/admin` 주소로 접근하면 admin 계정의 세션 ID를 확인할 수 있다.

현재까지 확인된 정보를 바탕으로, 플래그를 획득하기 위해 다음 절차를 수행하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/35.png)

`guest`/`guest`를 입력하여 guest 계정으로 로그인한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/36.png)

`/admin` 주소에 접근하여 admin 계정의 세션 ID를 획득한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/37.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/38.png)

개발자 도구를 통해 쿠키 값에 저장된 guest 계정의 세션 ID를 admin 계정의 세션 ID로 수정한다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/39.png)

이후 홈 페이지에 접속하면 플래그가 출력된다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">8f3d86d1134c26fedf7c4c3ecd563aae3da98d5c</span>}</span></p>

<br>
<br>
<br>

### xss-1

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/40.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 홈 페이지를 제외하고 총 3개의 페이지가 존재함을 알 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/41.png)

첨부 파일을 다운로드한 뒤 소스 코드를 확인하며 각 페이지가 수행하는 기능을 파악해 보았다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/42.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/43.png)

`/vuln` 엔드포인트는 XSS 취약점이 존재하는 페이지로, `param` 파라미터로 전달받은 값을 별도의 검증 없이 그대로 출력한다. 링크를 클릭하여 해당 페이지로 이동하면 기본적으로 `param=<script>alert(1)</script>`의 값이 설정되어 있는데, 해당 스크립트가 브라우저에 의해 실행되어 알림 창이 표시되는 것을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/44.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/45.png)

`/memo` 엔드포인트는 `memo` 파라미터로 전달받은 값을 `memo_text`에 추가한 뒤 화면에 출력하는 페이지이다. 링크를 클릭하여 해당 페이지로 이동하면 기본적으로 `memo=hello`의 값이 설정되어 있어, `hello` 문자열이 출력되는 것을 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/46.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/47.png)

`/flag` 엔드포인트는 입력받은 URL을 확인하는 봇이 구현된 페이지이다.  
`read_url()` 함수는 `url`과 `cookie` 값을 매개변수로 받는 함수이다. `driver.add_cookie(cookie)`, `driver.get(url)`와 같은 코드를 고려하면, 이 함수는 전달된 `cookie` 데이터를 쿠키에 저장하고 `url` 파라미터로 지정된 주소에 접속하는 동작을 수행함을 유추할 수 있다.  
`flag()` 함수는 내부에서 `check_xss()` 함수를 통해 `read_url()`을 호출하며, 이 과정에서 봇은 사용자가 입력한 `param` 값을 포함한 채 로컬호스트의 `/vuln` 엔드포인트에 접속하게 된다. 이때 플래그 값이 `cookie` 파라미터를 통해 봇의 쿠키에 저장되므로, 해당 쿠키 값을 탈취하면 플래그를 획득할 수 있다.

XSS 공격을 통해 쿠키를 탈취하기 위해 `param` 파라미터에 다음과 같은 스크립트를 작성하였다.

```html
<script>
  var img = new Image();
  img.src = '/memo?memo=' + document.cookie;
</script>
```

일반적으로 탈취한 쿠키 값을 전달받기 위해서는 외부에서 접근 가능한 웹 서버를 사용하지만, 본 애플리케이션에는 전달된 값을 화면에 출력하는 `/memo` 엔드포인트가 존재하므로 이를 활용하였다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/48.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/49.png)

해당 스크립트를 입력한 후 `/memo` 엔드포인트에서 플래그가 출력되는 것을 확인하였다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">2c01577e9542ec24d68ba0ffb846508e</span>}</span></p>

<br>
<br>
<br>

### xss-2

#### Description

![Description](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/40.png)

---

#### Write-Up

제공된 웹 사이트에 접속하면 xss-1과 동일한 형태의 페이지가 나타난다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/50.png)

xss-1과의 유일한 차이점은 `/vuln` 엔드포인트에서 확인할 수 있다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/51.png)
![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/52.png)

xss-2에서는 `/vuln` 엔드포인트가 단순히 `vuln.html`을 렌더링한다. 이에 따라 `vuln.html`을 살펴 보면, 쿼리 스트링에서 `param` 파라미터에 해당하는 값을 `innerHTML`을 통해 직접 DOM에 삽입하고 있음을 확인할 수 있다. 이때 삽입하는 값에 대해 어떠한 검증도 수행하지 않으므로 XSS 취약점이 존재할 것으로 예상된다.

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/53.png)

그러나 실제로 `/vuln` 엔드포인트에 접근하면 `param` 파라미터에 전달된 스크립트가 실행되지 않아 알림 창이 표시되지 않는 것을 확인할 수 있다. 그 이유가 무엇일까?

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/54.png)

공식 문서에 따르면 `innerHTML` 속성은 대표적인 XSS 공격 벡터(공격 경로)이기 때문에 `<script>` 태그가 삽입된 경우 해당 스크립트의 실행을 제한하도록 동작한다고 한다. 그러나 스크립트 실행을 위한 다른 방법들에 대해 취약하다는 설명에서 알 수 있듯이, 여전히 `/vuln` 엔드포인트에는 XSS 취약점이 존재한다. 이를테면, `<script>` 태그 대신 `<img>` 태그를 활용한 다음 페이로드를 `param` 파라미터에 전달해 보자.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-tag">&lt;<span class="hljs-name">img</span> <span class="hljs-attr">src</span>=<span class="hljs-string">"x"</span> <span class="hljs-attr">onerror</span>=<span class="hljs-string">"</span><span class="hljs-title function_">alert</span>(<span class="hljs-number">1</span>);<span class="hljs-string">"</span>&gt;</span>
</code></pre>


![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/55.png)

예상대로 알림 창이 표시되었다. 이후 xss-1에서와 동일한 방법을 적용하면 플래그를 획득할 수 있다.  
`/flag`로 이동한 뒤 다음 스크립트를 입력한다.

<pre><code class="language-html hljs language-xml" data-highlighted="yes"><span class="hljs-tag">&lt;<span class="hljs-name">img</span>
  <span class="hljs-attr">src</span>=<span class="hljs-string">"x"</span>
  <span class="hljs-attr">onerror</span>=<span class="hljs-string">"</span><span class="hljs-keyword">var</span> img = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Image</span>(); img.<span class="hljs-property">src</span> = <span class="hljs-string">'/memo?memo='</span> + <span class="hljs-variable language_">document</span>.<span class="hljs-property">cookie</span>;<span class="hljs-string">"</span>
&gt;</span>
</code></pre>

![Write-Up](/data/Dreamhack%20Wargames%20|%20Web%20Hacking%20I/56.png)

`/memo`로 이동하면 플래그가 출력된다.

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px); overflow-wrap:anywhere;">3c01577e9542ec24d68ba0ffb846508f</span>}</span></p>