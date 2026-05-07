import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { FILMS } from "../data/films";

const schema = Yup.object({
  email:    Yup.string().email("Enter a valid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const inp = (hasErr) => ({
  width:"100%", padding:"10px 13px", border:`1px solid ${hasErr?"#B03A2E":"#E8E2D9"}`,
  borderRadius:7, fontSize:13.5, color:"#0D0D0D", background:"#FAF7F2",
  outline:"none", boxSizing:"border-box",
});

export default function Login({ showToast }) {
  const { login } = useAuth();
  const navigate  = useNavigate();

  return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1.5rem", background:"#FAF7F2" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", border:"1px solid #E8E2D9", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,.14)", width:"100%", maxWidth:860 }}>
        <div style={{ background:"#0D0D0D", padding:"2.5rem", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 70%, rgba(201,168,76,.1) 0%, transparent 60%)", pointerEvents:"none" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:"2rem", position:"relative" }}>
            {FILMS.slice(0,4).map(f => (
              <div key={f.id} style={{ borderRadius:7, height:70, overflow:"hidden", opacity:.72 }}>
                <img src={f.poster} alt={f.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
              </div>
            ))}
          </div>
          <div style={{ position:"relative" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:"#fff", lineHeight:1.25, marginBottom:10 }}>Your next great<br/>film awaits.</h2>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.42)", lineHeight:1.75 }}>Join thousands of members renting DVDs from our curated catalog.</p>
          </div>
        </div>
        <div style={{ padding:"2.5rem", background:"#fff" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#0D0D0D", marginBottom:5 }}>Welcome back</h3>
          <p style={{ fontSize:13, color:"#5A5A5A", marginBottom:"1.6rem" }}>
            New to CineVault? <Link to="/register" style={{ color:"#C9A84C", fontWeight:500 }}>Create an account</Link>
          </p>
          <Formik
            initialValues={{ email:"", password:"" }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                await login(values.email, values.password);
                showToast("Welcome back!", "success");
                navigate("/dashboard");
              } catch (err) {
                setFieldError("password", err.message || "Invalid credentials");
                showToast(err.message || "Login failed", "error");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:10.5, fontWeight:500, color:"#5A5A5A", textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Email Address</label>
                  <Field name="email" type="email" placeholder="you@example.com" style={inp(errors.email && touched.email)} />
                  <ErrorMessage name="email" render={m => <div style={{ fontSize:11.5, color:"#B03A2E", marginTop:4 }}>{m}</div>} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:10.5, fontWeight:500, color:"#5A5A5A", textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Password</label>
                  <Field name="password" type="password" placeholder="••••••••" style={inp(errors.password && touched.password)} />
                  <ErrorMessage name="password" render={m => <div style={{ fontSize:11.5, color:"#B03A2E", marginTop:4 }}>{m}</div>} />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ width:"100%", background:"#0D0D0D", color:"#fff", border:"none", borderRadius:8, padding:11, fontSize:13.5, fontWeight:500, cursor:"pointer", marginTop:6, opacity:isSubmitting?.7:1 }}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
                <div style={{ textAlign:"center", fontSize:12, color:"#9A9A9A", marginTop:12 }}>
                  <Link to="/" style={{ color:"#C9A84C" }}>Forgot your password?</Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
