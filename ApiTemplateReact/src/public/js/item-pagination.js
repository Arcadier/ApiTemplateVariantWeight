$(document).ready(function () {
    var currentPage = 1;

    $(".pagination li.numeros").on('click', function () {
        $(".pagination li").removeClass("active");
        $(this).addClass("active");
        currentPage = parseInt($(this).text());
    });

    $(".pagination li.pag_prev").on('click', function () {
        if ($(this).next().is('.active')) return;
        $('.numeros.active').removeClass('active').prev().addClass('active');
        currentPage = currentPage > 1 ? (currentPage - 1) : 1;
    });

    $(".pagination li.pag_next").on('click', function () {
        if ($(this).prev().is('.active')) return;
        $('.numeros.active').removeClass('active').next().addClass('active');
    });
});