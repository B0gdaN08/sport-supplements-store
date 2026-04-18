

document.addEventListener('DOMContentLoaded', async () => {
  renderNavAuth();
  applyRoleUI();
  await loadBlogs();

 /* if (isAdmin()) {
    document.getElementById('createForm').addEventListener('submit', handleCreate);
  }*/
});


async function loadBlogs(){
    const {ok, data} = await apiFetch('/api/blogs');
    const blogs = ok? (data.data || []): [];

    //if(isAdmin()) Aqui tenemos que renderizar el panel para que pueda insertar blogs el administrador

    const grid= document.getElementById('blogsGrid');

    if(grid){
        grid.style.display= '';
        renderCardsBlogs(blogs, ok, data);
    }

}

function renderCardsBlogs(blogs, ok, data){
    const grid = document.getElementById('blogsCardBody');
        if (!grid) return;

        if (!ok) {
            grid.innerHTML = `<p style="color:var(--red);grid-column:1/-1;">${escHtml(data.error)}</p>`;
            return;
        }

        if (!blogs.length) {
            grid.innerHTML = `<div style="text-align:center;padding:60px;grid-column:1/-1;"><div style="font-size:48px;margin-bottom:16px;">📝</div><h3>No blogs yet</h3></div>`;
            return;
        }

        grid.innerHTML = blogs.map(blog => `
            <div class="blog-card" onclick="viewBlog(${blog.id})" style="cursor:pointer; background:var(--surface); border-radius:var(--radius-lg); overflow:hidden; transition:var(--transition); border:2px solid var(--border); margin-top:24px;"
                onmouseover="this.style.borderColor='rgba(180,255,60,0.25)'"
                onmouseout="this.style.borderColor='var(--border)'">
                ${blog.imageUrl && blog.imageUrl !== ""
                    ? `<img src="${escHtml(blog.imageUrl)}" alt="${escHtml(blog.title)}" style="width:100%; height:200px; object-fit:cover;">`
                    : `<div style="height:200px; background:var(--surface-2); display:flex; align-items:center; justify-content:center; font-size:48px;">📖</div>`
                }
                <div style="padding:20px;">
                    <h3 style="margin:0 0 10px 0;">${escHtml(blog.title)}</h3>
                    <!-- <p style="margin:0; color:var(--text-secondary);">${escHtml(blog.description.substring(0, 120))}...</p> -->
                    <small style="display:block; margin-top:12px; color:var(--text-muted);">📅 ${blog.createdAt ? blog.createdAt.split('T')[0] : 'Fecha desconocida'}</small>
                </div>
            </div>
        `).join('');
}

async function viewBlog(){
    try {
            const { ok, data } = await apiFetch(`/api/blogs/${id}`);

            if (!ok) {
                alert('Error: ' + (data.error || 'Blog no encontrado'));
                return;
            }

            const blog = data.data;

            // Guardar el blog en localStorage para mostrarlo en otra página
            localStorage.setItem('selectedBlog', JSON.stringify(blog));

            // Redirigir a la página de detalle
            window.location.href = '/blog-detail.html';

        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar el blog');
        }

}