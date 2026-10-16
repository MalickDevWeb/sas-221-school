const fs = require('fs');
const file = 'frontend (Copie)/src/features/admin/ui/components/students/StudentDataGridTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
content = 'import { EnrollTransferStudentModal } from "./EnrollTransferStudentModal";\n' + content;

// Add state
content = content.replace(
  "const [filterQr, setFilterQr] = useState('ALL');",
  "const [filterQr, setFilterQr] = useState('ALL');\n  const [isModalOpen, setIsModalOpen] = useState(false);"
);

// Add button
content = content.replace(
  /<p className="text-\[10px\] text-neutral-400 font-bold">Suivi d'accès QR, états de paiement et scolarité.<\/p>\n        <\/div>/,
  `<p className="text-[10px] text-neutral-400 font-bold">Suivi d'accès QR, états de paiement et scolarité.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[#1E293B] hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-colors">
          <span translate="no" className="material-symbols-outlined text-sm">person_add</span>
          Inscrire / Transférer
        </button>`
);

// Add Modal
content = content.replace(
  /<\/div>\n    <\/div>\n  \);\n}/,
  `    </div>
      <EnrollTransferStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => alert('Succès !')} />
    </div>
  );
}`
);

fs.writeFileSync(file, content);
