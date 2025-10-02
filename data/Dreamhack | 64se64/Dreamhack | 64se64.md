--- meta
title: Dreamhack | 64se64
date: 2025/07/24
excerpt: 64se64 풀이
categories: Dreamhack, 워게임
---

### Description

**[Unit]**: 컴퓨터 과학 기초  
**[Wargame]**: 64se64

![Description](/data/Dreamhack%20|%2064se64/1.png)

<br>
<br>
<br>

### Write-Up

첨부 파일을 다운로드하고 압축을 해제하면 `index.html` 파일을 확인할 수 있다.  
소스 코드를 살펴 보면 숨겨진 `<input>` 태그의 `value` 속성에 Base64 인코딩된 것으로 보이는 문자열이 지정되어 있다.

![Write-Up](/data/Dreamhack%20|%2064se64/2.png)

해당 문자열을 Base64 디코딩하면 다음과 같은 파이썬 스크립트를 획득할 수 있다.

```python
#!/usr/bin/env python3
asc=[68, 72, 123, 98, 101, 48, 52, 54, 98, 55, 53, 50, 50, 97, 97, 50, 101, 50, 56,
102, 50, 55, 54, 101, 48, 99, 57, 49, 48, 53, 50, 49, 102, 50, 51, 97, 48, 53, 56, 55, 48, 48, 53, 97, 56, 51, 55, 55, 51, 55, 48, 97, 49, 49, 101, 53, 101, 52, 100, 99, 49, 53, 102, 98, 50, 97, 98, 125]
arr=[0 for i in range(68)]
for i in range(0,68):
    arr[i]=chr(asc[i])
flag=''.join(arr)
print(flag)
```

위의 스크립트는 `asc` 리스트에 담긴 아스키 코드 값들을 문자로 변환한 뒤, 이를 순서대로 이어 붙여 최종 문자열을 생성하고 출력하는 코드이다. 스크립트를 실행하면 다음과 같이 플래그가 출력된다.

![Write-Up](/data/Dreamhack%20|%2064se64/3.png)

<p style="text-align: center;">Flag: <span style="color: green">DH{<span style="filter: blur(5px);">be046b7522aa2e28f276e0c910521f23a0587005a8377370a11e5e4dc15fb2ab</span>}</span></p>

<br>

> **셔뱅과 `#!/usr/bin/env python3`의 의미**
>
> <strong>셔뱅(Shebang, `#!`)</strong>은 Sharp(`#`)와 Bang(`!`)의 합성어로, 스크립트 파일의 첫 줄에 위치하는 특별한 문자 조합이다. Unix 계열 운영 체제에서 해당 스크립트를 실행할 인터프리터의 절대 경로를 지시하는 역할을 수행한다.
>
> 사용 예시는 다음과 같다.
> ```python
> #!/usr/bin/python3
> ```
> 위와 같은 지시문이 포함된 스크립트는 `/usr/bin/python3` 경로에 위치한 `python3` 인터프리터를 이용해 실행된다. 하지만 사용하는 시스템마다 `python3` 인터프리터가 설치된 위치가 다를 수 있어, 주로 다음과 같은 형태로 사용한다.
> ```python
> #!/usr/bin/env python3
> ```
> `/usr/bin/env`는 환경 변수(`PATH`)를 참조하여 실행 파일을 찾는 유틸리티 프로그램(`env` 명령어)이다. 운영 체제는 해당 지시문에 의해 현재 환경 변수에서 `python3` 실행 파일을 찾아 스크립트를 실행하게 되며, 다양한 환경에서 같은 스크립트가 유연하게 실행될 수 있다.