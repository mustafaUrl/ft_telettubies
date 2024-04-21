// Router'ın yöneteceği yollar ve bunlara karşılık gelen fonksiyonlar
const routes = {
    '/': function() { console.log('Ana sayfa'); },
    '/about': function() { console.log('Hakkında sayfası'); },
    '/contact': function() { console.log('İletişim sayfası'); }
  };
  
  // URL hash değişikliğini dinleyen fonksiyon
  function handleHashChange() {
    // URL'den hash'i al (örn: '#/about')
    const path = window.location.hash;
  
    // Hash'i kullanarak uygun fonksiyonu çağır
    if (routes[path]) {
      routespath;
    } else {
      // Tanımlanmamış bir yola gidildiğinde
      console.log('404 Sayfa bulunamadı!');
    }
  }
  
  // İlk yüklemede ve her hash değişikliğinde handleHashChange fonksiyonunu çağır
  window.addEventListener('load', handleHashChange);
  window.addEventListener('hashchange', handleHashChange);
  