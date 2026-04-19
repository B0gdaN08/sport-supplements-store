

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
                    ? `<img src="${escHtml(blog.imageUrl)}" alt="${escHtml(blog.title)}" style="width:100%; object-fit:cover;">`
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

async function viewBlog(id){

        const grid = document.getElementById('blogsGrid');
        const header = document.querySelector('.page-header');

        grid.style.display = 'none';
        header.style.display = 'none';


        const blogDetail = document.getElementById('blog-detail');
        blogDetail.style.display = 'block';


        blogDetail.innerHTML = `
            <div style="text-align:center;padding:60px;">
                <span class="spinner"></span>
                <p>Cargando blog...</p>
            </div>
        `;

        try {
            const {ok, data} = await apiFetch(`/api/blogs/${id}`);

            if (!ok) {
                blogDetail.innerHTML = `
                    <div style="text-align:center;padding:60px;">
                        <p style="color:var(--red);">❌ Error: ${data.error || 'Blog no encontrado'}</p>
                        <button onclick="returnList()" style="margin-top:20px; padding:10px 20px; cursor:pointer;">← Volver</button>
                    </div>
                `;
                return;
            }

            const blog = data.data;
            showCompleteBlog(blog);

        } catch (error) {
            console.error('Error:', error);
            blogDetail.innerHTML = `
                <div style="text-align:center;padding:60px;">
                    <p style="color:var(--red);">❌ Error de conexión</p>
                    <button onclick="returnList()" style="margin-top:20px; padding:10px 20px; cursor:pointer;">← Volver</button>
                </div>
            `;
        }
}

function showCompleteBlog(blog){
    const blogDetail = document.getElementById('blog-detail');

        blogDetail.innerHTML = `
            <div style="max-width:800px; margin:0 auto; padding:40px 20px;">

                <button onclick="returnList()" class="btn btn-primary" >
                                    ← See all blogs
                                </button>

                <h1 style="font-size:2.5rem; margin-bottom:20px;">${escHtml(blog.title)}</h1>

                ${blog.imageUrl && blog.imageUrl !== ""
                    ? `<img src="${escHtml(blog.imageUrl)}" alt="${escHtml(blog.title)}" style="width:100%; max-height:400px; object-fit:cover; border-radius:12px; margin:20px 0;">`
                    : ''
                }

                <div style="color:var(--text-muted); margin-bottom:30px;">
                    📅 ${blog.createdAt ? blog.createdAt.split('T')[0] : 'Fecha no disponible'}
                </div>

                <div style="line-height:1.8; font-size:1.1rem;">
                    ${escHtml(blog.description).replace(/\n/g, '<br>')}
                </div>
            </div>
        `;

}

function returnList(){

        const grid = document.getElementById('blogsGrid');
        const header = document.querySelector('.page-header');

        grid.style.display = '';
        header.style.display = '';

        const blogDetail = document.getElementById('blog-detail');
        blogDetail.style.display = 'none';
        blogDetail.innerHTML = '';
}