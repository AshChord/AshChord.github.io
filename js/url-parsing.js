// 현재 URL이 '/index.html'로 끝날 경우 처리
if (window.location.pathname === '/index.html') {
  // 'index.html'을 제거한 새로운 경로를 생성
  let newPath = window.location.pathname.replace('/index.html', '');

  // 마지막에 슬래시가 있으면 제거
  if (newPath.endsWith('/')) {
      newPath = newPath.slice(0, -1);  // 끝의 슬래시 제거
  }

  // history.replaceState()를 사용하여 URL을 변경합니다. 페이지는 리로드되지 않습니다.
  history.replaceState(null, "", newPath);
}