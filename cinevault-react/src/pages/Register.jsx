import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { FILMS } from "../data/films";

const schema = Yup.object({
  firstName: Yup.string().min(2,"Too short").required("Required"),
  lastName:  Yup.string().min(2,"Too short").required("Required"),
  email:     Yup.string().email("Invalid email").required("Required"),
  phone:     Yup.string().min(7,"Invalid").required("Required"),
  password:  Yup.string().min(8,"Min 8 characters").required("Required"),
  confirm:   Yup.string().oneOf([Yup.ref("password")],"Passwords must match").required("Required"),
});

const inp = (hasErr) => ({
  width:"100%", padding:"10px 13px", border:`1px solid ${hasErr?"#B03A2E":"#E8E2D9"}`,
  borderRadius:7, fontSize:13.5, color:"#0D0D0D", background:"#FAF7F2", outline:"none", boxSizing:"border-box",
});

const LF = ({ name, label, type="text", placeholder, errors, touched }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block", fontSize:10.5, fontWeight:500, color:"#5A5A5A", textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>{label}</label>
    <Field name={name} type={type} placeholder={placeholder} style={inp(errors[name] && touched[name])} />
    <ErrorMessage name={name} render={m => <div style={{ fontSize:11.5, color:"#B03A2E", marginTop:4 }}>{m}</div>} />
  </div>
);

export default function Register({ showToast }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1.5rem", background:"#FAF7F2" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", border:"1px solid #E8E2D9", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,.14)", width:"100%", maxWidth:860 }}>
        <div style={{ background:"#0D0D0D", padding:"2.5rem", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 70%, rgba(201,168,76,.1) 0%, transparent 60%)" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:"2rem", position:"relative" }}>
            {FILMS.slice(4,8).map(f => (
              <div key={f.id} style={{ borderRadius:7, height:70, overflow:"hidden", opacity:.72 }}>
                <img src={f.poster} alt={f.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
              </div>
            ))}
          </div>
          <div style={{ position:"relative" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:"#fff", lineHeight:1.25, marginBottom:10 }}>Cinema at<br/>your doorstep.</h2>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.42)", lineHeight:1.75 }}>Register now and start renting from thousands of titles today.</p>
          </div>
        </div>
        <div style={{ padding:"2.5rem", background:"#fff", overflowY:"auto", maxHeight:"90vh" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#0D0D0D", marginBottom:5 }}>Create Account</h3>
          <p style={{ fontSize:13, color:"#5A5A5A", marginBottom:"1.6rem" }}>
            Already a member? <Link to="/login" style={{ color:"#C9A84C", fontWeight:500 }}>Sign in</Link>
          </p>
          <Formik
            initialValues={{ firstName:"", lastName:"", email:"", phone:"", password:"", confirm:"" }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await register(values);
                showToast(`Welcome to CineVault, ${values.firstName}!`, "success");
                navigate("/dashboard");
              } catch (err) {
                showToast(err.message || "Registration failed", "error");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <LF name="firstName" label="First Name" placeholder="Ahmed"  errors={errors} touched={touched} />
                  <LF name="lastName"  label="Last Name"  placeholder="Hassan" errors={errors} touched={touched} />
                </div>
                <LF name="email"    label="Email"            type="email"    placeholder="you@example.com"   errors={errors} touched={touched} />
                <LF name="phone"    label="Phone"            type="tel"      placeholder="+20 100 000 0000"  errors={errors} touched={touched} />
                <LF name="password" label="Password"         type="password" placeholder="Min. 8 characters" errors={errors} touched={touched} />
                <LF name="confirm"  label="Confirm Password" type="password" placeholder="Repeat password"   errors={errors} touched={touched} />
                <button type="submit" disabled={isSubmitting} style={{ width:"100%", background:"#0D0D0D", color:"#fff", border:"none", borderRadius:8, padding:11, fontSize:13.5, fontWeight:500, cursor:"pointer", marginTop:6, opacity:isSubmitting?.7:1 }}>
                  {isSubmitting ? "Creating account..." : "Create my account"}
                </button>
                <div style={{ textAlign:"center", fontSize:12, color:"#9A9A9A", marginTop:12 }}>
                  By signing up you agree to our <Link to="/" style={{ color:"#C9A84C" }}>Terms of Service</Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
