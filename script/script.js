function normalizeText(text = '') {
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitDescription(description = '') {
  const parts = description.split(/<br\s*\/?>\s*<br\s*\/?>/i);
  return {
    intro: normalizeText(parts[0] || ''),
    detail: normalizeText(parts.slice(1).join(' ') || '')
  };
}

function groupTechStack(techStack = []) {
  const categories = ["Backend", "Frontend", "AI", "Database", "Infrastructure", "Monitoring", "Tools", "Build"];
  const groups = new Map();

  categories.forEach(category => groups.set(category, []));
  groups.set("Other", []);

  techStack.forEach(item => {
    const matchedCategory = categories.find(category => item.startsWith(`${category} `));
    if (matchedCategory) {
      groups.get(matchedCategory).push(item.slice(matchedCategory.length + 1).trim());
      return;
    }
    groups.get("Other").push(item);
  });

  return Array.from(groups.entries())
    .filter(([, values]) => values.length > 0)
    .map(([category, values]) => ({ category, values }));
}

function applyPrintModeFromQuery() {
  const mode = new URLSearchParams(window.location.search).get('print');

  document.body.classList.remove('print-compact', 'print-compact-strong', 'print-compact-lite', 'print-color');

  if (mode === 'compact') {
    document.body.classList.add('print-compact');
    return;
  }

  if (mode === 'compact-strong') {
    document.body.classList.add('print-compact', 'print-compact-strong');
    return;
  }

  if (mode === 'compact-lite') {
    document.body.classList.add('print-compact-lite');
    return;
  }

  if (mode === 'color') {
    document.body.classList.add('print-color');
  }
}

function buildProjectCard(project) {
    const desc = splitDescription(project.description);
    const summary = project.summary || desc.intro;
    const spotlight = project.spotlight || desc.detail || `${project.title}에서 실제 사용자 문제를 해결하기 위해 기획부터 구현까지 진행했습니다.`;
    const techStack = project.techStack || project.tags.map(tag => tag.name);
    const techStackGroups = project.techStack ? groupTechStack(project.techStack) : null;
    const aiAssist = project.aiAssist || [];
    const role = project.role || null;
    const troubleShooting = project.troubleShooting || [];
    const results = project.results || [];

    return `
      <article class="project-card detail-card">
        <div class="project-title-row">
          <h3 class="project-title">${project.title}</h3>
          <span class="project-duration">${project.duration || ''}</span>
        </div>

        ${project.company ? `<p class="project-company"><i class="fas fa-briefcase"></i> ${project.company}</p>` : ''}

        <p class="project-summary">${summary}</p>

        <p class="project-spotlight">
          ${spotlight}
        </p>

        ${role ? `
        <section class="project-subsection project-role-section">
          <h4>담당 역할 <span class="role-team-badge">${role.team}</span></h4>
          <ul class="feature-list">
            ${role.mine.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </section>
        ` : ''}

        <div class="project-main-grid">
          <section class="project-subsection">
            <h4>주요 기능</h4>
            <ul class="feature-list">
              ${project.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </section>

          <section class="project-subsection">
            <h4>기술 스택</h4>
            ${techStackGroups
              ? `
                <div class="project-stack-groups">
                  ${techStackGroups.map(group => `
                    <div class="stack-group">
                      <p class="stack-group-title">${group.category}</p>
                      <div class="project-stack-wrap">
                        ${group.values.map(tech => `<span class="stack-pill">${tech}</span>`).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `
              : `
                <div class="project-stack-wrap">
                  ${techStack.map(tech => `<span class="stack-pill">${tech}</span>`).join('')}
                </div>
              `
            }
          </section>
        </div>

        ${troubleShooting.length ? `
        <section class="project-subsection project-trouble-section">
          <h4>트러블슈팅</h4>
          <div class="trouble-list">
            ${troubleShooting.map(t => `
              <div class="trouble-item">
                <div class="trouble-row trouble-problem"><span class="trouble-label">문제</span><span>${t.problem}</span></div>
                <div class="trouble-row trouble-solution"><span class="trouble-label">해결</span><span>${t.solution}</span></div>
                <div class="trouble-row trouble-result"><span class="trouble-label">결과</span><span>${t.result}</span></div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        ${results.length ? `
        <section class="project-subsection project-results-section">
          <h4>성과</h4>
          <ul class="feature-list result-list">
            ${results.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </section>
        ` : ''}

        ${aiAssist.length
          ? `
            <section class="project-subsection">
              <h4>AI 활용</h4>
              <ul class="ai-assist-list">
                ${aiAssist.map(item =>
                  typeof item === 'string'
                    ? `<li><span class="ai-tool-name">${item}</span></li>`
                    : `<li><span class="ai-tool-name">${item.tool}</span><span class="ai-tool-usage">${item.usage}</span></li>`
                ).join('')}
              </ul>
            </section>
          `
          : ''
        }

        ${project.repoConfig ? `
        <div class="card-footer">
          <a href="${project.repoConfig.url}" class="card-link card-link-light" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-github"></i> GitHub Repository
          </a>
          <a href="#" class="card-link card-link-dark" onclick="openReadme('${project.repoConfig.path}'); return false;">
            <i class="far fa-file-lines"></i> README
          </a>
        </div>
        ` : ''}
      </article>
    `;
}

function renderProjects() {
  const careerItems = projects.filter(project => project.type === 'career');
  const projectItems = projects.filter(project => project.type !== 'career');

  const careerGrid = document.querySelector('.career-grid');
  if (careerGrid) {
    careerGrid.innerHTML = careerItems.map(buildProjectCard).join('');
  }

  const projectGrid = document.querySelector('.project-grid');
  if (projectGrid) {
    projectGrid.innerHTML = projectItems.map(buildProjectCard).join('');
  }
}

// 기존 openReadme 함수는 글로벌 스코프로 유지해야 onclick에서 호출 가능
window.openReadme = async function (repoPath) {
  const modal = document.getElementById('readme-modal');
  const contentDiv = document.getElementById('readme-content');
  const titleSpan = document.getElementById('modal-repo-name');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  titleSpan.innerText = repoPath;
  contentDiv.innerHTML = '<div style="text-align:center; padding: 3rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>README를 불러오는 중입니다...</div>';

  try {
    let branch = 'main';
    let response = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);

    if (!response.ok) {
      branch = 'master';
      response = await fetch(`https://raw.githubusercontent.com/${repoPath}/master/README.md`);
    }

    if (!response.ok) throw new Error('README 파일을 찾을 수 없습니다.');

    const text = await response.text();
    let absoluteText = text.replace(
      /!\[(.*?)\]\((?!http)(.*?)\)/g,
      `![$1](https://raw.githubusercontent.com/${repoPath}/${branch}/$2)`
    );

    absoluteText = absoluteText.replace(
      /<img([^>]*?)src=(["'])(.*?)\2([^>]*?)>/gi,
      (match, p1, quote, src, p4) => {
        if (src.startsWith('http')) {
          if (src.includes('github.com') && src.includes('/blob/')) {
            return `<img${p1}src="${src.replace('/blob/', '/raw/')}"${p4}>`;
          }
          return match;
        }
        return `<img${p1}src="https://raw.githubusercontent.com/${repoPath}/${branch}/${src}"${p4}>`;
      }
    );

    contentDiv.innerHTML = marked.parse(absoluteText);

  } catch (error) {
    contentDiv.innerHTML = `<div style="text-align:center; padding: 2rem; color: #ef4444;">
          <i class="fas fa-exclamation-circle fa-2x"></i><br><br>
          <p>README를 불러오지 못했습니다.<br>(${error.message})</p>
          <a href="https://github.com/${repoPath}" target="_blank" style="text-decoration:underline;">GitHub에서 직접 보기</a>
        </div>`;
  }
};

window.closeReadme = function () {
  const modal = document.getElementById('readme-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  applyPrintModeFromQuery();

  // 프로젝트 렌더링
  renderProjects();

  // 모달 이벤트 리스너
  const modal = document.getElementById('readme-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeReadme();
    });
  }
});
