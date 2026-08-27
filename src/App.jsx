import {
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { STORE_CONFIG } from "./config/store";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from "./services/products";
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "./services/categories";
import {
  uploadProductImage,
  deleteProductImage,
  getProductImageUrl,
} from "./services/storage";
import { formatCurrency, friendlyError } from "./utils";
const Img = ({ p }) =>
  p.image_path ? (
    <img src={getProductImageUrl(p.image_path)} alt={p.name} />
  ) : (
    <div className="placeholder">Sem imagem</div>
  );
function Store() {
  const [products, setProducts] = useState([]),
    [cats, setCats] = useState([]),
    [search, setSearch] = useState(""),
    [cat, setCat] = useState(""),
    [error, setError] = useState("");
  const { addProduct, itemCount } = useCart();
  useEffect(() => {
    Promise.all([getProducts(true), getCategories(true)])
      .then(([a, b]) => {
        if (a.error || b.error) throw a.error || b.error;
        setProducts(a.data || []);
        setCats(b.data || []);
      })
      .catch((e) => setError(friendlyError(e)));
  }, []);
  const list = products.filter(
    (p) =>
      (!cat || p.category_id === cat) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main>
      <header>
        <Link to="/" className="brand">
          {STORE_CONFIG.name}
        </Link>
        <input
          aria-label="Buscar produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto"
        />
        <Link to="/cart" className="cart-link">
          Carrinho <span className="cart-badge">{itemCount}</span>
        </Link>
        <Link to="/admin">Admin</Link>
      </header>
      <section className="hero">
        <h1>{STORE_CONFIG.name}</h1>
        <p>{STORE_CONFIG.description}</p>
      </section>
      <nav className="categories">
        <button className={!cat ? "selected" : ""} onClick={() => setCat("")}>
          Todos
        </button>
        {cats.map((c) => (
          <button
            className={cat === c.id ? "selected" : ""}
            onClick={() => setCat(c.id)}
            key={c.id}
          >
            {c.name}
          </button>
        ))}
      </nav>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <section className="grid">
          {list.map((p) => {
            const stock = Number(p.stock || 0);
            return (
              <article className="card" key={p.id}>
                <Img p={p} />
                <div className="card-content">
                  <small>{p.categories?.name}</small>
                  <h2>{p.name}</h2>
                  <strong>{formatCurrency(p.price)}</strong>
                  <span className={stock ? "stock" : "stock out"}>
                    {stock ? `${stock} em estoque` : "Fora de estoque"}
                  </span>
                  <button disabled={!stock} onClick={() => addProduct(p)}>
                    {stock ? "Adicionar ao carrinho" : "IndisponÃ­vel"}
                  </button>
                </div>
              </article>
            );
          })}
          {!list.length && <p>Nenhum produto encontrado.</p>}
        </section>
      )}
      <footer>
        © {new Date().getFullYear()} {STORE_CONFIG.name}
      </footer>
    </main>
  );
}
function Cart() {
  const {
    items,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearCart,
  } = useCart();
  const [name, setName] = useState(""),
    [note, setNote] = useState(""),
    [delivery, setDelivery] = useState("Retirada na loja");
  const finish = () => {
    if (!name.trim()) return alert("Informe seu nome.");
    const lines = items
      .map(
        (i) =>
          i.quantity +
          "x " +
          i.name +
          " - " +
          formatCurrency(i.price * i.quantity),
      )
      .join("\n");
    const text =
      "Olá! Gostaria de fazer um pedido.\n\n*PEDIDO*\n\n" +
      lines +
      "\n\n*Total:* " +
      formatCurrency(total) +
      "\n\n*Cliente:* " +
      name +
      "\n\n*Forma de entrega:* " +
      delivery +
      (note ? "\n\n*Observação:*\n" + note : "");
    window.open(
      "https://wa.me/" +
        STORE_CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(text),
      "_blank",
    );
    clearCart();
  };
  return (
    <main className="checkout">
      <Link to="/">Continuar comprando</Link>
      <h1>Seu carrinho</h1>
      {!items.length ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          {items.map((i) => (
            <div className="cart" key={i.id}>
              <Img p={i} />
              <span>{i.name}</span>
              <button onClick={() => decreaseQuantity(i.id)}>Remover</button>
              {i.quantity}
              <button onClick={() => increaseQuantity(i.id)}>+</button>
              <span>{formatCurrency(i.price * i.quantity)}</span>
              <button onClick={() => removeProduct(i.id)}>Excluir</button>
            </div>
          ))}
          <h2>Total: {formatCurrency(total)}</h2>
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Forma de entrega
            <select
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
            >
              <option>Retirada na loja</option>
              <option>Entrega</option>
            </select>
          </label>
          <label>
            Observação
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button onClick={finish}>Finalizar pedido pelo WhatsApp</button>
        </>
      )}
    </main>
  );
}
function Login() {
  const { login } = useAuth(),
    nav = useNavigate();
  const [email, setEmail] = useState(""),
    [pass, setPass] = useState(""),
    [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, pass);
      nav("/admin");
    } catch {
      (x) => x;
      setErr("E-mail ou senha inválidos.");
    }
  };
  return (
    <main className="login">
      <h1>Área administrativa</h1>
      <form onSubmit={submit}>
        <label>
          E-mail
          <input
            type="email"
            required
            value={email}
            placeholder="Digite aqui seu email..."
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            required
            placeholder="Digite aqui sua senha..."
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </label>
        {err && <p className="error">{err}</p>}
        <button>Entrar</button>
      </form>
    </main>
  );
}
function AdminLayout({ children }) {
  const { user, profile, loading, logout } = useAuth();
  if (loading) return <main>Carregando...</main>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!profile || !["admin", "staff"].includes(profile.role))
    return (
      <main>
        <p>Acesso não autorizado.</p>
        <button onClick={logout}>Sair</button>
      </main>
    );
  return (
    <main className="admin">
      <header>
        <Link to="/" className="brand">
          {STORE_CONFIG.shortName}
        </Link>
        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/products">Produtos</Link>
          <Link to="/admin/categories">Categorias</Link>
          <Link to="/">Ver loja</Link>
        </nav>
        <button onClick={logout}>Sair</button>
      </header>
      <div className="admin-body">
        <aside>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/products">Produtos</Link>
          <Link to="/admin/categories">Categorias</Link>
        </aside>
        <section className="admin-content">{children}</section>
      </div>
    </main>
  );
}
function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([p, c]) =>
      setStats({ p: p.data || [], c: c.data || [] }),
    );
  }, []);
  if (!stats) return <p>Carregando painel...</p>;
  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <p>
          Produtos<strong>{stats.p.length}</strong>
        </p>
        <p>
          Ativos<strong>{stats.p.filter((x) => x.active).length}</strong>
        </p>
        <p>
          Inativos<strong>{stats.p.filter((x) => !x.active).length}</strong>
        </p>
        <p>
          Categorias<strong>{stats.c.length}</strong>
        </p>
      </div>
      <div className="actions">
        <Link className="button" to="/admin/products/new">
          + Novo produto
        </Link>
        <Link className="button" to="/admin/products">
          Gerenciar produtos
        </Link>
        <Link className="button" to="/admin/categories">
          Gerenciar categorias
        </Link>
      </div>
    </>
  );
}
function Products() {
  const [items, setItems] = useState([]),
    [msg, setMsg] = useState(""),
    [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    getProducts()
      .then(({ data, error }) => {
        setItems(data || []);
        setMsg(error ? friendlyError(error) : "");
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const toggle = async (p) => {
    const { error } = await toggleProductStatus(p.id, !p.active);
    setMsg(
      error
        ? friendlyError(error)
        : "Produto " + (!p.active ? "ativado" : "desativado") + " com sucesso.",
    );
    if (!error) load();
  };
  const del = async (p) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await deleteProduct(p.id);
    if (!error) await deleteProductImage(p.image_path);
    setMsg(error ? friendlyError(error) : "Produto excluÃ­do com sucesso.");
    if (!error) load();
  };
  return (
    <>
      <div className="page-title">
        <h1>Produtos</h1>
        <Link className="button" to="/admin/products/new">
          + Novo produto
        </Link>
      </div>
      {msg && <p className="feedback">{msg}</p>}
      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <div className="table">
          {items.map((p) => (
            <article className="row" key={p.id}>
              <Img p={p} />
              <div>
                <strong>{p.name}</strong>
                <small>{p.categories?.name || "Sem categoria"}</small>
              </div>
              <span>{formatCurrency(p.price)}</span>
              <span className="stock">Estoque: {Number(p.stock || 0)}</span>
              <span className={p.active ? "status on" : "status"}>
                {p.active ? "Ativo" : "Inativo"}
              </span>
              <div className="row-actions">
                <Link to={"/admin/products/" + p.id + "/edit"}>Editar</Link>
                <button onClick={() => toggle(p)}>
                  {p.active ? "Desativar" : "Ativar"}
                </button>
                <button className="danger" onClick={() => del(p)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
          {!items.length && <p>Nenhum produto cadastrado.</p>}
        </div>
      )}
    </>
  );
}
function ProductForm() {
  const { id } = useParams(),
    nav = useNavigate(),
    editing = !!id;
  const [data, setData] = useState({
      name: "",
      price: "",
      stock: "",
      category_id: "",
      description: "",
      active: true,
      image_path: "",
    }),
    [cats, setCats] = useState([]),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [msg, setMsg] = useState("");
  useEffect(() => {
    Promise.all([
      getCategories(true),
      editing ? getProductById(id) : Promise.resolve({ data: null }),
    ])
      .then(([c, p]) => {
        setCats(c.data || []);
        if (p.data) {
          setData({
            ...p.data,
            price: String(p.data.price),
            stock: String(p.data.stock ?? 0),
          });
          setPreview(getProductImageUrl(p.data.image_path));
        }
        if (c.error || p.error) setMsg(friendlyError(c.error || p.error));
      })
      .finally(() => setLoading(false));
  }, [id, editing]);
  const choose = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type))
      return setMsg("Formato de imagem não suportado. Use JPG, PNG ou WEBP.");
    if (f.size > 5242880)
      return setMsg("Imagem muito grande. O máximo são 5 MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg("");
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.price || !data.category_id || data.stock === "")
      return setMsg("Preencha nome, preço, estoque e categoria.");
    setSaving(true);
    try {
      let image_path = data.image_path;
      if (file) image_path = await uploadProductImage(file);
      const payload = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        image_path,
      };
      const r = editing
        ? await updateProduct(id, payload)
        : await createProduct(payload);
      if (r.error) throw r.error;
      if (file && data.image_path) await deleteProductImage(data.image_path);
      nav("/admin/products");
    } catch (e) {
      setMsg(friendlyError(e));
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <p>Carregando formulário...</p>;
  if (!cats.length)
    return (
      <>
        <h1>{editing ? "Editar produto" : "Novo produto"}</h1>
        <p>
          Nenhuma categoria cadastrada. Cadastre uma categoria antes de criar
          produtos.
        </p>
        <Link className="button" to="/admin/categories">
          Gerenciar categorias
        </Link>
      </>
    );
  return (
    <form className="form" onSubmit={submit}>
      <h1>{editing ? "Editar produto" : "Novo produto"}</h1>
      {msg && <p className="error">{msg}</p>}
      <label>
        Nome
        <input
          required
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </label>
      <label>
        Preço
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={data.price}
          onChange={(e) => setData({ ...data, price: e.target.value })}
        />
      </label>
      <label>
        Estoque
        <input
          required
          type="number"
          min="0"
          step="1"
          value={data.stock}
          onChange={(e) => setData({ ...data, stock: e.target.value })}
        />
      </label>
      <label>
        Categoria
        <select
          required
          value={data.category_id}
          onChange={(e) => setData({ ...data, category_id: e.target.value })}
        >
          <option value="">Selecione uma categoria</option>
          {cats.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Descrição
        <textarea
          value={data.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </label>
      <label>
        Imagem
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={choose}
        />
      </label>
      {preview && (
        <img className="preview" src={preview} alt="PrÃ©via do produto" />
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={data.active}
          onChange={(e) => setData({ ...data, active: e.target.checked })}
        />{" "}
        Disponível
      </label>
      <div className="actions">
        <button type="button" onClick={() => nav("/admin/products")}>
          Cancelar
        </button>
        <button disabled={saving}>
          {saving
            ? file
              ? "Enviando imagem..."
              : "Salvando produto..."
            : editing
              ? "Salvar alterações"
              : "Cadastrar produto"}
        </button>
      </div>
    </form>
  );
}
function Categories() {
  const [items, setItems] = useState([]),
    [form, setForm] = useState(null),
    [msg, setMsg] = useState(""),
    [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    getCategories()
      .then(({ data, error }) => {
        setItems(data || []);
        setMsg(error ? friendlyError(error) : "");
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const save = async (e) => {
    e.preventDefault();
    const r = form.id
      ? await updateCategory(form.id, form)
      : await createCategory(form);
    setMsg(r.error ? friendlyError(r.error) : "Categoria salva com sucesso.");
    if (!r.error) {
      setForm(null);
      load();
    }
  };
  const toggle = async (c) => {
    const { error } = await toggleCategoryStatus(c.id, !c.active);
    setMsg(error ? friendlyError(error) : "Status da categoria atualizado.");
    if (!error) load();
  };
  const del = async (c) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    const { error } = await deleteCategory(c.id);
    setMsg(
      error
        ? "NÃ£o Ã© possÃ­vel excluir esta categoria porque existem produtos associados a ela."
        : "Categoria excluÃ­da com sucesso.",
    );
    if (!error) load();
  };
  return (
    <>
      <div className="page-title">
        <h1>Categorias</h1>
        <button onClick={() => setForm({ name: "", active: true })}>
          + Nova categoria
        </button>
      </div>
      {msg && <p className="feedback">{msg}</p>}
      {form && (
        <form className="inline-form" onSubmit={save}>
          <label>
            Nome
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            Ativa
          </label>
          <button>Salvar categoria</button>
          <button type="button" onClick={() => setForm(null)}>
            Cancelar
          </button>
        </form>
      )}
      {loading ? (
        <p>Carregando categorias...</p>
      ) : (
        <div className="table">
          {items.map((c) => (
            <article className="row category-row" key={c.id}>
              <strong>{c.name}</strong>
              <span className={c.active ? "status on" : "status"}>
                {c.active ? "Ativa" : "Inativa"}
              </span>
              <div className="row-actions">
                <button onClick={() => setForm(c)}>Editar</button>
                <button onClick={() => toggle(c)}>
                  {c.active ? "Desativar" : "Ativar"}
                </button>
                <button className="danger" onClick={() => del(c)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
          {!items.length && <p>Nenhuma categoria cadastrada.</p>}
        </div>
      )}
    </>
  );
}
const Private = ({ children }) => <AdminLayout>{children}</AdminLayout>;
export default () => (
  <AuthProvider>
    <CartProvider>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <Private>
              <Dashboard />
            </Private>
          }
        />
        <Route
          path="/admin/products"
          element={
            <Private>
              <Products />
            </Private>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <Private>
              <ProductForm />
            </Private>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <Private>
              <ProductForm />
            </Private>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <Private>
              <Categories />
            </Private>
          }
        />
      </Routes>
    </CartProvider>
  </AuthProvider>
);


