var Features;

_ = async function () {
    await Dependency.wait([{ id: "platform" }])

    Features = await fetch(platform.runtime.getURL("features/features.json")).
        then(r => r.json())
}()