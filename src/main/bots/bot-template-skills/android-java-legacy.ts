export const SKILL = `---
name: android-java-legacy
description: Maintenance guide for legacy Android Java codebases and Java-Kotlin interop — nullability annotations, JVM interop, memory leak fixes, ViewBinding/Fragment lifecycle, JUnit+Mockito tests, Desugaring, and security.
---

# Android Legacy Java Maintenance & Kotlin Interop

Use this skill when maintaining existing Java Android modules, fixing bugs in Java classes, or incrementally migrating Java code to Kotlin without breaking callers.

## 1. Java <-> Kotlin Interoperability

- **Nullability Annotations**: Always annotate Java public methods, parameters, and fields with \`@NonNull\` / \`@Nullable\` (\`androidx.annotation\`) so Kotlin callers avoid unsafe platform types (\`T!\`).
- **Kotlin Called from Java**:
  - Add \`@JvmOverloads\` on functions/constructors with default parameters.
  - Add \`@JvmStatic\` / \`@JvmField\` on companion members accessed directly from Java.
  - Add \`@Throws(IOException::class)\` for checked exceptions expected by Java callers.
- **Immutability & Collections**: Return \`Collections.unmodifiableList(...)\` or \`List.copyOf(...)\` from public Java APIs instead of mutable lists.

## 2. Legacy Concurrency & Memory Leak Prevention

- **Context & Handler Leaks**: Never use non-static inner classes for \`Handler\`, \`Runnable\`, \`AsyncTask\`, or listeners that capture an \`Activity\`/\`View\`. Use \`static\` inner classes with \`WeakReference\`, or replace \`AsyncTask\` with \`ExecutorService\`, \`WorkManager\`, or Kotlin Coroutines at module boundaries.
- **Resource Hygiene**: Always wrap \`Cursor\`, \`InputStream\`, \`OutputStream\`, and \`SQLiteDatabase\` readers in \`try-with-resources\` so streams close on exceptions.
- **Thread Safety**: Guard shared mutable state with \`ConcurrentHashMap\`, \`Atomic*\`, or explicit locks; avoid blocking the main thread.

## 3. Legacy UI & Lifecycle (XML / ViewBinding / Fragment)

- **ViewBinding in Fragments**: Clear \`binding = null\` in \`onDestroyView()\` to prevent view hierarchy leaks on the back stack.
- **RecyclerView**: Use \`ListAdapter\` + \`DiffUtil.ItemCallback\` instead of \`notifyDataSetChanged()\`.
- **Lifecycle**: Prefer \`LifecycleOwner\` / \`LiveData\` or \`repeatOnLifecycle\` observers over manual \`onStart\`/\`onStop\` callback registration.

## 4. Testing Legacy Java Code

- Write characterization tests with **JUnit 4/5** + **Mockito** (\`@Mock\`, \`when(...).thenReturn(...)\`, \`verify(...)\`) before refactoring legacy Java classes.
- Extract pure logic out of \`Activity\`/\`Fragment\` into plain Java/Kotlin helpers so tests run fast on the JVM without Robolectric when possible.

## 5. Build, Desugaring & Security

- **Java Compatibility & Desugaring**: Keep \`compileOptions\` (\`sourceCompatibility\` / \`targetCompatibility\`) aligned with the project's AGP/JDK policy; enable \`isCoreLibraryDesugaringEnabled = true\` when using \`java.time\` or modern APIs below \`minSdk\` 26.
- **Annotation Processors**: Do not mix \`annotationProcessor\` and \`kapt\`/\`ksp\` inconsistently for the same processor (e.g. Dagger/Hilt, Room, Glide) in mixed modules.
- **SQL & Storage**: Never concatenate strings in \`SQLiteDatabase.rawQuery\` or \`execSQL\`—always use \`selectionArgs\` (\`?\` bind parameters). Migrate plaintext \`SharedPreferences\` secrets to \`EncryptedSharedPreferences\`.
- **ProGuard / R8**: Keep \`@Keep\` or explicit \`proguard-rules.pro\` entries on reflection targets, Parcelables, and \`@JavascriptInterface\` Java classes.
`
