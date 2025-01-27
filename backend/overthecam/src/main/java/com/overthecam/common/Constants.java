package com.overthecam.common;


import lombok.Getter;

public class Constants {

    @Getter
    public enum ExceptionClass {

        STORE("Store");

        private String exceptionClass; //에러가 발생한 class의 이름

        ExceptionClass(String exceptionClass) {
            this.exceptionClass = exceptionClass;
        } //생성자 주입

        @Override
        public String toString() {
            return getExceptionClass() + " Exception. ";
        } //Store에서 에러가 발생할경우 Store Exception. 으로 출력되게끔 한다.
    }

}
