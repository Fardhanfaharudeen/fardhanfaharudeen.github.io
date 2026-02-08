$baseUrl = "https://wpriverthemes.com/HTML/davies/"
$assets = @(
    "assets/fonts/fonts.css",
    "assets/icon/icomoon/style.css",
    "assets/css/bootstrap.min.css",
    "assets/css/swiper-bundle.min.css",
    "assets/css/animate.css",
    "assets/css/odometer.min.css",
    "assets/css/styles.css",
    "assets/js/bootstrap.min.js",
    "assets/js/jquery.min.js",
    "assets/js/swiper-bundle.min.js",
    "assets/js/carousel.js",
    "assets/js/infinityslide.js",
    "assets/js/ScrollSmooth.js",
    "assets/js/gsap.min.js",
    "assets/js/gsapAnimation.js",
    "assets/js/SplitText.min.js",
    "assets/js/ScrollTrigger.min.js",
    "assets/js/odometer.min.js",
    "assets/js/jquery.nice-select.min.js",
    "assets/js/unicornStudio.umd.js",
    "assets/js/main.js",
    "assets/images/video/wave-bg.mp4",
    "assets/images/video/nexbot.mp4",
    "assets/images/video/davies-video.mp4",
    "assets/icon/icomoon/fonts/icomoon.eot",
    "assets/icon/icomoon/fonts/icomoon.ttf",
    "assets/icon/icomoon/fonts/icomoon.woff",
    "assets/icon/icomoon/fonts/icomoon.svg",
    "assets/images/logo/favicon.svg",
    "assets/images/item/davies-stroke.svg",
    "assets/images/item/davies-fill.svg",
    "assets/images/item/global.svg",
    "assets/images/item/dither-effect.svg",
    "assets/images/item/badge-design.png",
    "assets/images/item/figma.svg",
    "assets/images/item/framer.svg",
    "assets/images/item/webflow.svg",
    "assets/images/item/gird-net.png",
    "assets/images/section/davies-main.jpg",
    "assets/images/section/work-5.jpg",
    "assets/images/section/work-6.jpg",
    "assets/images/section/service-4.jpg",
    "assets/images/section/service-5.jpg",
    "assets/images/section/service-6.jpg",
    "assets/images/section/award-1.jpg",
    "assets/images/section/award-2.jpg",
    "assets/images/section/award-3.jpg",
    "assets/images/section/award-4.jpg",
    "assets/images/section/award-5.jpg",
    "assets/images/section/award-6.jpg",
    "assets/images/section/tes-v2-1.jpg",
    "assets/images/section/tes-v2-2.jpg",
    "assets/images/section/tes-v2-3.jpg",
    "assets/images/brand/brandv2-1.svg",
    "assets/images/brand/brandv2-2.svg",
    "assets/images/brand/brandv2-3.svg",
    "assets/images/brand/brandv2-4.svg",
    "assets/images/brand/brandv2-5.svg",
    "assets/images/brand/brandv2-6.svg",
    "assets/images/brand/brandv2-7.svg",
    "assets/images/brand/brandv2-8.svg",
    "assets/images/brand/brandv2-9.svg",
    "assets/images/brand/brandv2-10.svg",
    "assets/images/logo/agency.png"
)

foreach ($asset in $assets) {
    $url = $baseUrl + $asset
    $dest = $asset
    $dir = [System.IO.Path]::GetDirectoryName($dest)
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
    if (!(Test-Path $dest)) {
        Write-Host "Downloading $url to $dest"
        try {
            Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
        }
        catch {
            Write-Host "Failed to download $url"
        }
    }
}
