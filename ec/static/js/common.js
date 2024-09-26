window.addEventListener('DOMContentLoaded', function () {
  // 一応、動きを見るための最低限のJSをつけていますが、Nuxtの方で実装していただく場合はこちら削除してください。

  // 商品詳細クリック時の説明部分スライド
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      const detail = document.getElementsByClassName("product__detail-title");
      for (let i = 0; i < detail.length; i++) {
        detail[i].addEventListener(
          "click",
          function () {
            detail[i].classList.toggle("open");
            let detailContent = detail[i].nextElementSibling;
            if (detail[i].classList.contains("open")) {
              detailContent.style.height = detailContent.scrollHeight + "px";
            } else {
              detailContent.style.height = "0";
            }
          },
          false
        );
      }
    },
    false
  );

  // カートクリック時のモーダル表示
  document.getElementById("cartBox").addEventListener("click", function () {
    document.getElementById("cart-modal").classList.toggle("show");
    document.getElementsByTagName("body")[0].classList.toggle("fixed");
  });

  // カートモーダル閉じるボタンクリック時の非表示
  document
    .getElementById("cartModalClose")
    .addEventListener("click", function () {
      document.getElementById("cart-modal").classList.remove("show");
      document.getElementsByTagName("body")[0].classList.remove("fixed");
    });

  // Swiper
  var swiper = new Swiper(".swiper-container", {
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
});
