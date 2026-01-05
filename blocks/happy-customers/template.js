export const happyCustomersTemplate = `
<div class="happy-customers-wrapper">
  <h2 class="happy-customers-title">{title}</h2>
  <div class="happy-customers-container">
    <img src="{ribbonImg1}" alt="Ribbon decoration" class="ribbon-decoration ribbon-left-top">
    <img src="{ribbonImg2}" alt="Ribbon decoration" class="ribbon-decoration ribbon-right-top">
    <img src="{ribbonImg3}" alt="Ribbon decoration" class="ribbon-decoration ribbon-left-bottom">
    <img src="{ribbonImg4}" alt="Ribbon decoration" class="ribbon-decoration ribbon-right-bottom">
    <input type="hidden" id="rotation-time" value="{rotationTime}">
    {cards}
  </div>
</div>
`;

export const customerCardTemplate = `
<div class="happy-customer-card {customerClass}" id="{customerId}">
  <div class="customer-image-wrapper">
    <img src="{customerImage}" loading="lazy" alt="{customerName}" class="customer-image">
    <div class="customer-ring ring-1"></div>
    <div class="customer-ring ring-2"></div>
    <div class="customer-ring ring-3"></div>
  </div>
  <div class="customer-testimonial-box">
    <div class="testimonial-arrow"></div>
    <div class="testimonial-content">
      <p class="customer-details {customerDetailsClass}">{customerDetails}</p>
      <p class="customer-name {customerNameClass}">{customerName}</p>
      <p class="customer-profession {customerProfessionClass}">{customerProfession}</p>
    </div>
  </div>
</div>
`;
