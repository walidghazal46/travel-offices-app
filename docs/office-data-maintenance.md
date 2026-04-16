## Office Data Maintenance

الملف المرجعي المعتمد لتحديث قاعدة المكاتب هو:

- `companies_data0.xlsx`

التقرير المحفوظ داخل المشروع بعد كل مراجعة أو إعادة بناء هو:

- `office-data/office-rebuild-report.json`

هذا التقرير يحتوي على:

- ملخص عدد المكاتب في Excel وعدد المكاتب الحالية في التطبيق.
- عدد السجلات التي تم حذفها لأنها مكررة أو متضاربة.
- كل حالات تعارض الترخيص التي تم حلها.
- خريطة تحويل `id` القديمة إلى `id` الرسمية الجديدة.

### الأوامر

معاينة فقط مع حفظ التقرير:

```bash
npm run sync:offices:report
```

معاينة بملف Excel مختلف تحدده أنت:

```bash
npm run sync:offices:file:report -- --excel another-file.xlsx
```

إعادة بناء قاعدة المكاتب داخل التطبيق مع حفظ التقرير:

```bash
npm run sync:offices:apply:report
```

إعادة البناء بملف Excel مختلف تحدده أنت:

```bash
npm run sync:offices:file:apply:report -- --excel another-file.xlsx
```

التحقق النهائي من سلامة التطبيق:

```bash
npm run build
```

### طريقة التحديث الصحيحة

1. حدّث الملف `companies_data0.xlsx` بالنسخة الجديدة المعتمدة.
2. شغّل `npm run sync:offices:report`.
3. راجع الملف `office-data/office-rebuild-report.json` وتأكد من حالات التعارض والتحويل.
4. إذا التقرير سليم، شغّل `npm run sync:offices:apply:report`.
5. شغّل `npm run build` للتأكد أن التطبيق ما زال سليمًا.

### لو اسم ملف Excel سيتغير كل مرة

إذا الملف ليس اسمه `companies_data0.xlsx`، استخدم نفس الخطوات لكن بالأوامر المرنة:

1. معاينة:

```bash
npm run sync:offices:file:report -- --excel your-new-file.xlsx
```

2. تطبيق:

```bash
npm run sync:offices:file:apply:report -- --excel your-new-file.xlsx
```

3. تحقق نهائي:

```bash
npm run build
```

ولو أردت تقريرًا باسم مختلف أيضًا:

```bash
npm run sync:offices:file:report -- --excel your-new-file.xlsx --report office-data/my-custom-report.json
```

### ماذا يحدث تلقائيًا

- يتم اعتماد ملف Excel كمصدر الحقيقة.
- يتم حذف أي مكتب مكرر أو غير مطابق لرقم الترخيص في ملف Excel.
- يتم الإبقاء على `id` القديمة متى كان ذلك آمنًا.
- عند وجود أكثر من سجل لنفس الترخيص، يتم اختيار السجل الأقرب لاسم وعنوان ومركز المكتب في Excel.
- يتم إنشاء خريطة `officeIdAliases` داخل `src/App.jsx` حتى لا تضيع المراجعات القديمة المرتبطة بسجلات تم إلغاؤها.

### ملاحظات مهمة

- لا تعدل `officesData` يدويًا طالما التحديث قادم من Excel.
- أي إضافة أو تصحيح دائم للمكاتب يجب أن يبدأ من `companies_data0.xlsx` ثم يُعاد بناء القائمة بالأوامر السابقة.
- لو استخدمت ملفًا باسم مختلف، مرره دائمًا عبر `--excel` ولا تنقل البيانات يدويًا إلى `src/App.jsx`.
- الملفان المرجعيان لهذا المسار هما `scripts/sync-offices-from-excel.cjs` و `office-data/office-rebuild-report.json`.