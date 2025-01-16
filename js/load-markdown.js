// 마크다운 파일을 불러와서 HTML로 변환하고 contents 요소에 삽입하는 함수
async function loadMarkdown(postTitle) {
  try {
    // 제목에 맞는 마크다운 파일 경로 (예: /posts/{title}.md)
    const markdownUrl = `/posts/${postTitle.toLowerCase().replace(/\s+/g, '-')}.md`;

    const response = await fetch(markdownUrl);
    if (!response.ok) {
      throw new Error('Markdown 파일을 불러오는 데 실패했습니다.');
    }
    const markdownText = await response.text();

    // 마크다운을 HTML로 변환
    const htmlContent = marked.parse(markdownText);

    // contents 클래스를 가진 요소에 HTML 삽입
    const contents = document.querySelector('.contents');
    contents.innerHTML = htmlContent;

    // 코드 블록 하이라이팅
    hljs.highlightAll();
  } catch (error) {
    console.error('Error loading markdown:', error);
    const contents = document.querySelector('.contents');
    contents.innerHTML = '<p class="error">게시물 내용을 불러오는데 실패했습니다.</p>';
  }
}