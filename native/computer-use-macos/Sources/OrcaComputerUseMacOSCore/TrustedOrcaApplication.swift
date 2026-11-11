/// Bundle ids of the apps whose computer-use sidecar may drive this helper.
public enum TrustedOrcaApplication {
    public static func isTrusted(bundleId: String) -> Bool {
        // Why: `pnpm dev` launches as `com.hanwha.adehone.dev` and per-worktree wrapper apps use
        // `com.hanwha.adehone.dev.<name>`; the sidecar peer check must authorize both (#26498).
        bundleId == "com.hanwha.adehone" ||
            bundleId == "com.hanwha.adehone.dev" ||
            bundleId.hasPrefix("com.hanwha.adehone.dev.") ||
            bundleId == "com.github.Electron"
    }
}
