const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

code = code.replace(
  "  const { siteSettings, isAdminAuthed, logout } = useApp();\n  React.useEffect(() => {\n    if (!isAdminAuthed) {\n      navigate('/admin/login');\n    }\n  }, [isAdminAuthed, navigate]);\n  if (!isAdminAuthed) return null;\n  const navigate = useNavigate();",
  "  const { siteSettings, isAdminAuthed, logout } = useApp();\n  const navigate = useNavigate();\n  React.useEffect(() => {\n    if (!isAdminAuthed) {\n      navigate('/admin/login');\n    }\n  }, [isAdminAuthed, navigate]);\n  if (!isAdminAuthed) return null;"
);

fs.writeFileSync('src/components/AdminLayout.tsx', code);
