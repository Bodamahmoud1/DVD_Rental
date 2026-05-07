import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { apiUpdateProfile, apiUploadProfilePic } from "../services/api";

const schema = Yup.object({
  name:  Yup.string().min(2,"Too short").required("Name required"),
  email: Yup.string().email("Invalid email").required("Email required"),
  phone: Yup.string().min(7,"Invalid phone").required("Phone required"),
  dob:   Yup.string().required("Date of birth required"),
});

const BADGE = { active:["#DCFCE7","#166534"], due:["#FEF9C3","#854D0E"], over:["#FEE2E2","#991B1B"], done:["#F1F5F9","#475569"] };
const LABEL = { active:"Active", due:"Due Soon", over:"Overdue", done:"Returned" };

export default function Profile({ showToast }) {
  const { user, patchUser, refreshUser, rentals } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileRef = useRef(null);

  if (!user) { navigate("/login"); return null; }

  // profilePic is now always a base64 data URI (e.g. "data:image/jpeg;base64,...")
  // or a legacy /uploads path. Handle both.
  const profilePicRaw = String(user.profilePic || "").trim();
  const profilePicUrl = profilePicRaw
    ? (/^data:/.test(profilePicRaw)
        ? profilePicRaw
        : `http://localhost:5000${profilePicRaw.startsWith("/") ? "" : "/"}${profilePicRaw.replace(/\\/g, "/")}`)
    : null;

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please select an image file", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB", "error"); return; }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = await apiUploadProfilePic(reader.result);
          setImgError(false);
          patchUser({ profilePic: data.profilePic });
          showToast("Profile picture updated!", "success");
          // Force re-render by clearing error state
          setTimeout(() => setImgError(false), 50);
        } catch (err) {
          showToast(err.message || "Upload failed", "error");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const memberSince = user.joinDate
    ? new Date(user.joinDate).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    : user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    : "N/A";

  return (
    <div style={{ padding:"2rem 2.5rem", background:"#FAF7F2", minHeight:"calc(100vh - 64px)", animation:"fadeIn .35s ease" }}>
      <button onClick={() => navigate("/dashboard")} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"#5A5A5A", background:"none", border:"none", cursor:"pointer", marginBottom:"1.5rem" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Back to Dashboard
      </button>

      <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:"1.4rem" }}>
        {/* Profile card */}
        <div style={{ background:"#fff", border:"1px solid #E8E2D9", borderRadius:12, padding:"1.8rem", textAlign:"center" }}>
          {/* Avatar / Profile Picture */}
          <div style={{ position:"relative", display:"inline-block", marginBottom:14 }}>
            {profilePicUrl && !imgError ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                style={{ width:76, height:76, borderRadius:"50%", objectFit:"cover", border:"3px solid #C9A84C" }}
                onError={() => {
                  setImgError(true);
                  showToast("Could not load profile photo. Please upload again.", "error");
                }}
              />
            ) : (
              <div style={{ width:76, height:76, borderRadius:"50%", background:"#0D0D0D", color:"#F0D080", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:24, border:"3px solid #C9A84C" }}>
                {user.initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ position:"absolute", bottom:-2, right:-2, width:24, height:24, borderRadius:"50%", background:"#C9A84C", border:"2px solid #fff", color:"#0D0D0D", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              title="Change photo"
            >
              {uploading ? "…" : "✎"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePicUpload} style={{ display:"none" }} />
          </div>

          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:"#0D0D0D", marginBottom:3 }}>{user.name}</div>
          <div style={{ fontSize:12.5, color:"#9A9A9A", marginBottom:"1.4rem" }}>{user.email}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:"1.4rem" }}>
            {[[rentals.length,"Rentals"],[memberSince,"Member Since"]].map(([v,l]) => (
              <div key={l} style={{ background:"#FAF7F2", borderRadius:7, padding:11, textAlign:"center" }}>
                <strong style={{ display:"block", fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#0D0D0D" }}>{v}</strong>
                <small style={{ fontSize:9.5, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:.8 }}>{l}</small>
              </div>
            ))}
          </div>
          <button onClick={() => setEditing(!editing)} style={{ width:"100%", background:"#fff", border:"1px solid #E8E2D9", borderRadius:7, padding:9, fontSize:12.5, fontWeight:500, color:"#2A2A2A", cursor:"pointer" }}>
            {editing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        {/* Main panel */}
        <div style={{ background:"#fff", border:"1px solid #E8E2D9", borderRadius:12, padding:"1.8rem" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:1.2, marginBottom:"1.2rem", paddingBottom:9, borderBottom:"1px solid #E8E2D9" }}>Personal Information</div>

          <Formik
            enableReinitialize
            initialValues={{
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
            }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await apiUpdateProfile({
                  memberName: values.name,
                  phone: values.phone,
                  dob: values.dob,
                });
                patchUser({ name: values.name, memberName: values.name, phone: values.phone, dob: values.dob });
                showToast("Profile updated successfully!", "success");
                setEditing(false);
              } catch (err) {
                showToast(err.message || "Update failed", "error");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, resetForm }) => (
              <Form>
                <div className="profile-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.2rem" }}>
                  {[["name","Full Name","text"],["phone","Phone","tel"],["email","Email","email"],["dob","Date of Birth","date"]].map(([n,l,t]) => (
                    <div key={n}>
                      <label style={{ display:"block", fontSize:10.5, fontWeight:500, color:"#5A5A5A", textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>{l}</label>
                      <Field name={n} type={t} disabled={!editing || n === "email"}
                        style={{ width:"100%", padding:"10px 13px", border:`1px solid ${errors[n]&&touched[n]?"#B03A2E":"#E8E2D9"}`, borderRadius:7, fontSize:13.5, color:"#0D0D0D", background: editing && n !== "email" ?"#fff":"#FAF7F2", outline:"none", cursor: editing && n !== "email" ?"text":"default", boxSizing:"border-box" }}
                      />
                      <ErrorMessage name={n} render={m => <div style={{ fontSize:11.5, color:"#B03A2E", marginTop:4 }}>{m}</div>} />
                    </div>
                  ))}
                </div>
                {editing && (
                  <div style={{ display:"flex", gap:10, marginBottom:"1.8rem" }}>
                    <button type="submit" style={{ background:"#C9A84C", color:"#0D0D0D", border:"none", borderRadius:7, padding:"9px 22px", fontSize:13, fontWeight:500, cursor:"pointer" }}>Save Changes</button>
                    <button type="button" onClick={() => { resetForm(); setEditing(false); }} style={{ background:"#fff", color:"#0D0D0D", border:"1px solid #E8E2D9", borderRadius:7, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Cancel</button>
                  </div>
                )}
              </Form>
            )}
          </Formik>

          {/* Recent rentals */}
          <div style={{ fontSize:11, fontWeight:500, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:1.2, marginTop:editing?0:"1.8rem", marginBottom:"1rem", paddingTop:16, borderTop:"1px solid #E8E2D9" }}>Recent Rentals</div>
          {rentals.slice(0,4).map(r => (
            <div key={r.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #E8E2D9", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontSize:13.5, fontWeight:500, color:"#0D0D0D" }}>{r.filmTitle}</div>
                <div style={{ fontSize:11.5, color:"#9A9A9A", marginTop:2 }}>Rented {r.dateRented} · Due {r.dueDateBack}</div>
              </div>
              <span style={{ fontSize:10.5, padding:"3px 10px", borderRadius:12, fontWeight:500, background:BADGE[r.status][0], color:BADGE[r.status][1] }}>{LABEL[r.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
